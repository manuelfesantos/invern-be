---
status: Done
priority: P0
feature: 04-testing-quality-gates
track: backend-hardening
depends_on: ["04-testing-quality-gates/step-01"]
blocks: []
---
# Step 02: Baseline suites for the riskiest existing paths

**Status:** Done · **Priority:** P0 · **Feature:** [Testing & Quality Gates](./README.md)

> **Progress note (2026-07-08).** Baseline suites now cover most enumerated
> risk modules: crypto/hash (`password`,`hash`), JWT round-trip + AES-GCM
> (`jwt-role`,`refresh-token`,`encryptor`), **`getCredentials` branch matrix**
> (`get-credentials`: missing/invalid/logged-in/anonymous), the **R2 lock**
> (`r2-lock`, asserting the *fixed* behaviour from 03-step-01), tax/price math
> (`extender-math`), number utils (`number-utils`), PII redaction (`redact`),
> and **webhook guards** (`stripe-guards`: isStripe*/isStripeEnvValid). 73 tests.
> Also fixed the CI gate for the post-migration layout: the quality-gate
> `typecheck` job now runs `npm run type-check` **and** `npm run type-check:apps`
> (Turbo) so `apps/backend` is actually type-checked (root tsc excludes apps).
>
> **Done (SPIRIT-104).** The two remaining mocked suites landed — **96 tests / 22
> suites**:
> - `reserve-line-items` (compensation): extracted `reserveLineItems` from
>   `checkout/index.ts` into its own module and tested that a failed R2/KV
>   stock-store write **restores the D1 decrement** (compensation), and that the
>   happy path mirrors once with no compensation. D1 actions + `stockClient` mocked.
> - `cart-operations`: `selectProductStockAndQuantityOperation` (returns
>   stock/quantity; quantity defaults to 0; **stock 0 ≠ not-found**; throws
>   `PRODUCT_NOT_FOUND` on a missing stock record) and `upsertProductQuantityOperation`
>   (returns the cart; throws `CART_NOT_FOUND`), with `runBatchOperation` mocked.
>
> The Stripe-signed webhook-replay integration test was **verified live** in
> [03 step-03](../03-payment-stock-integrity/step-03-webhook-idempotency.md) (signed events,
> real handler); folding that into an automated CI suite is a noted non-blocking
> follow-up there (needs a real D1 or a heavier Stripe+D1 harness), not part of
> this baseline step.


## Technical goal
Put baseline unit coverage on the code where a regression costs the most, **as it exists today**, so the P0 refactors in features 01–03 have a safety net *before* they start changing this code.

## User impact
Internal only; indirectly protects login, checkout and stock behavior for shoppers and admins.

## Current state
Zero tests exist. The highest-risk modules identified in the audit:
- `libs/utils/crypto/hash.ts` (password hashing — about to be migrated by 02-step-01, so pin current behavior first).
- `libs/utils/jwt/jwt-utils.ts` + `libs/utils/jwt/credentials/get-credentials.ts` (token verify/refresh fallback logic with four distinct branches).
- `libs/adapters/r2/utils/lock.ts` + `libs/adapters/r2/stock/stock-client.ts` (lock + tri-store writes — feature 03 rewrites these).
- `libs/modules/order/use-cases/checkout/index.ts` `reserveLineItems` (compensation logic).
- `libs/modules/cart/use-cases/**` quantity/stock validation (`select-product-stock-and-quantity`, `upsert-product-quantity`).
- `libs/utils/extender/**` (price/tax math — pure functions, cheap to cover, money-relevant).
- Webhook event parsing/guards (`libs/entities/stripe/*`, `isStripeEnvValid`).

## Technical steps
1. **Pin current behavior before refactors** (characterization tests): hashing round-trip and known-vector output; JWT sign→verify→decode round-trip including the AES-GCM encrypt wrapper; `getCredentials` branch matrix (valid access token / expired access + valid refresh / invalid both / anonymous), using the KV fake for the `AUTH_KV` check.
2. Lock behavior tests against the R2 fake: current behavior documented (including the race and format bug as *known-failing* or explicitly-documented tests) so feature 03's fix flips them to passing assertions of the correct behavior.
3. `reserveLineItems`: mock the product actions and `stockClient`; assert D1 rollback on stockClient failure (current contract), and out-of-stock validation errors.
4. Pure-function sweep: `libs/utils/extender/utils/*` (tax amount, taxed price, order status), `libs/utils/number`, `libs/utils/encoding`, `redactPropertiesFromData` (document the current accessToken-only behavior — feature 06 will extend the list and update these tests).
5. Webhook guards: `isStripeSessionResultEvent`/`isStripeSessionExpiredEvent`/`isStripePaymentIntent` and `isStripeEnvValid` with fixture events.
6. Keep each suite colocated (`*.test.ts` beside the module or under `test/`, matching the pattern chosen in step-01) and fast (<10s total).

## Dependencies
**Depends on:** [step-01](./step-01-jest-scaffolding-and-fakes.md).
**Blocks:** None formally, but features 01–03 are much safer landed after this.

## Implementation notes
- Characterization tests **assert what the code does, not what it should do** — e.g., today `getCredentials` treats a valid-refresh-token flow as requiring the KV secret to match; capture that. When features 01–03 change behavior, they update these tests deliberately, which is exactly the review signal wanted.
- For the two known lock bugs, prefer explicit tests named e.g. `documents current race: two first-acquires both succeed (BUG — fixed in 03-step-01)` marked with `.failing`/`todo` semantics or asserting the buggy behavior with a linking comment. Choose one style and stay consistent.
- Don't chase a coverage percentage; chase the enumerated modules above. Coverage thresholds can be introduced once numbers stabilize (note for step-03).

## Acceptance criteria
- [ ] Suites exist for: hashing, JWT + credentials matrix, lock, stock-client write path, `reserveLineItems`, extender math, webhook guards.
- [ ] The two lock bugs are captured as documented/known-failing tests referencing 03-step-01.
- [ ] Whole test run stays fast (≈ seconds, not minutes) and green in CI.
- [ ] Test names/comments make the characterization intent clear to the next engineer.

## References
- Modules listed in "Current state" above — each is the test subject.
- `test/harness.ts`, `test/fakes/*` — from step-01.
- [03 — Payment & Stock Integrity](../03-payment-stock-integrity/README.md) — the refactors these tests protect.
- [02 — Credential & Session Hardening](../02-credential-session-hardening/README.md) — ditto for hashing/tokens.
