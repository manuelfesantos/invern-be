---
status: Done
priority: P0
feature: 03-payment-stock-integrity
track: backend-hardening
depends_on: []
blocks: []
---
# Step 03: Verify & harden webhook idempotency

**Status:** Done · **Priority:** P0 · **Feature:** [Payment & Stock Integrity](./README.md)

> **Progress note (2026-07-08).** Idempotency fixes implemented + type-checked:
> (1) the duplicate-order guard now matches on **`stripeId`** via a new
> `getSelectOrdersByStripeIdAction` (the old check queried `ordersTable.id` with
> the Stripe session id, so it never matched); a replay short-circuits at the top
> of `getOrderFromSessionResult`, returning the existing order — no second order,
> no second email, and the webhook handler answers 2xx so Stripe stops retrying.
> (2) Dead `check-if-order-exists.ts` removed. (3) **Session-expired replay** is
> already idempotent — `getPopCheckoutSessionByIdAction` pops (select+delete), so
> a replay finds nothing and releases stock at most once (confirmed finding).
> (4) Payment-intent precedence: `created`/`processing`/`failed`/`canceled` already
> reject terminal states; added the missing guard so a late **`succeeded`** can't
> regress a canceled/failed payment, and reordered `handleFailedPayment` to run
> its idempotency check **before** the stock release (a replayed cancel no longer
> double-releases stock).
>
> **Verified end-to-end (2026-07-08, this session) — now Done.** Drove the real
> webhook handler locally with **HMAC-signed** Stripe events (signed with the
> actual `whsec_…` secrets, verified by `stripe.webhooks.constructEventAsync` — no
> Stripe API/CLI, no charges, Brevo disabled so no email left the machine):
> seeded a valid `checkout_sessions` row → POSTed a signed
> `checkout.session.completed` → order created (idempotency **miss**); **replayed**
> the same signed event → returned the **same** order id, orders `total` stayed **1**
> (no duplicate), no second email → idempotency **hit** via
> `getSelectOrdersByStripeIdAction`. Also exercised by-id (list + `/:id`), by-user
> (user-orders), and by-payment (a signed `payment_intent.canceled` → stock
> restored 10→11, payment `state=canceled`). Committed as SPIRIT-103 (`893a626`).
>
> The one remaining *nicety* (not blocking): fold this signed-webhook replay into
> an automated Jest suite in [04 step-02](../04-testing-quality-gates/step-02-critical-path-suites.md) so it runs in CI — the behavior itself is verified.


## Technical goal
Guarantee that replayed/retried Stripe webhook events (`/stripe/session-result`, `/stripe/payment-intent`) cannot double-create orders, double-adjust anything, or corrupt payment state — and that *already-processed* replays are acknowledged with a `2xx` so Stripe stops retrying.

## User impact
Shoppers: no duplicate orders/emails after transient failures cause Stripe retries. On-call: webhook retry storms don't create error noise or inconsistent records.

## Current state
Signature verification is already correct on both handlers (a positive finding — do not touch): each calls `stripe().webhooks.constructEventAsync` with its own secret (`STRIPE_CHECKOUT_SECRET` / `STRIPE_PAYMENT_SECRET`) and returns 401/400 on missing/invalid signatures (`functions/stripe/session-result/index.ts`, `functions/stripe/payment-intent/index.ts`).

Idempotency, however, has gaps (verified in `libs/modules/order/use-cases/get-order-from-session-result.ts`):
- The duplicate-order guard queries **the wrong column**: `getCheckoutData` calls `getSelectOrdersByIdAction(sessionId)`, but `getSelectOrdersByIdAction` filters `ordersTable.id` (`libs/db/order/actions/select.ts` — `selectOrdersByIdQuery` → `eq(ordersTable["id"], id)`), while the order is *created* with `id = checkoutSession.orderId` (a UUID) and `stripeId = sessionResult.id` (`cs_...`). The guard can therefore **never** match; `errors.ORDER_ALREADY_EXISTS()` is unreachable via this check.
- Actual duplicate protection comes indirectly: `orders.stripe_id` has a unique constraint (`db/schema.ts` `stripeId: text("stripe_id").notNull().unique()`), and the checkout session is deleted in the same batch that inserts the order — so a replayed `session-completed` event fails at "Checkout session not found" or on the unique constraint. That prevents duplicates but returns an **error** (5xx) to Stripe, which keeps retrying until it gives up, and the failure mode is accidental, not designed.
- There is also a dead `check-if-order-exists.ts` action (`libs/db/order/actions/`) that nothing imports.
- `payment-intent` events upsert payments (`getPayment` insert-or-update in `get-order-from-session-result.ts`; `mapPaymentIntentEvent` with `withRetry`). Stripe delivers event types out of order (`created`/`processing`/`succeeded` can interleave) — whether a late `processing` can overwrite a `succeeded` state needs verification in the `getPaymentFromPaymentIntent*Event` mappers (`libs/modules/order/use-cases/payment/**`) — **not fully verified this session; treat as an open item to confirm during implementation.**

## Technical steps
1. Fix the duplicate-order guard to query by `stripeId`: use `getAllOrders("stripeId", sessionId)`-style select (the `where: "stripeId"` option already exists in `selectOrdersQuery`) or a dedicated `getSelectOrderByStripeIdAction`. Delete the dead `check-if-order-exists.ts` or rewrite it to be the guard.
2. Change replay handling to be **acknowledging**: when the order for that `stripeId` already exists, return `successResponse.OK("order already processed")` (2xx) instead of throwing — Stripe treats non-2xx as retry-needed. Keep the unique constraint as the last line of defense.
3. Review the payment-intent state transitions: enumerate the mappers in `libs/modules/order/use-cases/payment/` and ensure a terminal state (`succeeded`, `canceled`, `failed`) cannot be overwritten by a non-terminal late event (`created`, `processing`). Implement a simple precedence check before `getUpdatePaymentAction` writes.
4. Confirm no stock is adjusted in the webhook path (stock is reserved at checkout-session creation and released on expiry — verified for `session-result`; double-check `handleSessionExpiredEvent` is idempotent: it "pops" the session first via `getPopCheckoutSessionByIdAction`, so a replayed expiry finds no session and exits — verify the pop is atomic within a batch).
5. Tests: replayed completed-session event → 2xx + single order; expired-session replay → 2xx + single stock release; out-of-order payment-intent events → terminal state preserved.

## Dependencies
**Depends on:** None (independent of the lock work).
**Blocks:** None.

## Implementation notes
- **Do not weaken signature verification while refactoring** — it's the part that's already right.
- Return-2xx-on-duplicate must only apply to *verified* events; unsigned requests keep getting 401.
- The email side effect (`sendCheckoutSuccessfulEmail`) runs after order creation; the duplicate-ack path must **not** resend it.
- When testing, construct events with Stripe's signing helper (`stripe.webhooks.generateTestHeaderString` or sign manually with the test secret) rather than bypassing verification, so the test covers the real entry path.
- Out-of-order events are a documented Stripe behavior; the precedence rule (step 3) is the standard fix. Keep it a small pure function so it's trivially testable.

## Acceptance criteria
- [x] The duplicate-order guard matches on `stripeId` (`getSelectOrdersByStripeIdAction`); verified live via signed-webhook replay (automated Jest coverage deferred to [04 step-02](../04-testing-quality-gates/step-02-critical-path-suites.md)).
- [x] A replayed `checkout.session.completed` event returns 2xx, creates no second order, and sends no second email — live-verified (replay returned the same order, `total` stayed 1, no email).
- [x] A replayed session-expired event returns 2xx and releases stock at most once — confirmed finding (`getPopCheckoutSessionByIdAction` pops = select+delete; replay finds nothing).
- [x] A late non-terminal `payment_intent.*` event cannot regress a terminal payment state — guards added in the mappers + `handleFailedPayment` idempotency-before-release (documented finding).
- [x] Dead `check-if-order-exists.ts` removed.

## References
- `functions/stripe/session-result/index.ts`, `functions/stripe/payment-intent/index.ts` — handlers (signature verification correct).
- `libs/modules/order/use-cases/get-order-from-session-result.ts` — `getCheckoutData` (wrong-column guard), `getPayment` upsert, email side effect.
- `libs/db/order/actions/select.ts` — `selectOrdersQuery` `where` options (`stripeId` exists).
- `libs/db/order/actions/check-if-order-exists.ts` — dead code.
- `db/schema.ts` — `orders.stripe_id` unique constraint.
- `libs/modules/order/use-cases/handle-session-expired-event.ts` — pop-then-release pattern.
- `libs/modules/order/use-cases/payment/**` — payment-intent mappers + `withRetry`.
