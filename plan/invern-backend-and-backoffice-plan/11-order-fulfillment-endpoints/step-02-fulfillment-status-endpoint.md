---
status: Not Started
priority: P0
feature: 11-order-fulfillment-endpoints
track: backend-api-completion
depends_on: ["01-admin-auth-rbac-cors/step-02"]
blocks: ["11-order-fulfillment-endpoints/step-03"]
---
# Step 02: Shipping-transaction status & tracking update endpoint

**Status:** Not Started · **Priority:** P0 · **Feature:** [Order & Fulfillment Endpoint Improvements](./README.md)

## Technical goal
Add an admin use-case and route to update an order's fulfillment: set `shippingTransactions.status` (with valid transitions) and `trackingUrl`, so staff can mark orders shipped/delivered and attach tracking.

## User impact
Admin staff can process fulfillment. Shoppers: see accurate status + a tracking link (the storefront order view already reads the shipping transaction).

## Current state
- `shippingTransactionsTable`: `{ id, status: processing|shipped|delivered|canceled, trackingUrl, timestamps }` (`db/schema.ts`).
- `getUpdateShippingTransactionAction` exists (`libs/db/shipping-transaction/actions/update.ts`) but is **unused** outside its own folder (verified) — no use-case, no route exposes it.
- A shipping transaction is created as `processing` when the order is created (`get-order-from-session-result.ts`).
- Orders link to it via `orders.shippingTransactionId`; order detail already includes `shippingTransaction` (the order select joins it — `libs/db/order/actions/select.ts` `with: { shippingTransaction: true }`).

## Technical steps
1. Add a shipping-transaction module/use-case (`libs/modules/shipping/use-cases/transaction/**` or under order fulfillment): `updateFulfillment(shippingTransactionId, { status?, trackingUrl? })` over `getUpdateShippingTransactionAction`, with validation.
2. Enforce a state machine for `status`: allowed transitions e.g. `processing → shipped → delivered`, and `→ canceled` from processing/shipped; reject illegal jumps (e.g. `delivered → processing`). Encode transitions as a small map and validate before writing.
3. Validate `trackingUrl` (well-formed URL; optional; typically set when moving to `shipped`). Consider requiring a tracking URL when transitioning to `shipped` (product decision — recommend optional but encouraged).
4. Expose the route. Two shape options (pick one, document):
   - **Order sub-resource:** `PUT /private/orders/{id}/fulfillment` — the admin addresses the order they're looking at; the handler resolves the order's `shippingTransactionId` and updates it. Most natural for the UI.
   - **Direct:** `PUT /private/shipping/transactions/{id}` — addresses the transaction directly. Requires the UI to know the transaction id (it's in the order detail).
   - Recommended: the **order sub-resource** (`/private/orders/{id}/fulfillment`) so the backoffice orders screen ([19](../19-backoffice-orders/README.md)) works from the order it already has.
5. Return the updated shipping transaction (or the full order with it) so the UI reflects the new state.
6. Coordinate with cancel: canceling an **order** (`isCanceled`) is distinct from a shipping transaction's `canceled` status — clarify whether canceling an order should also set the transaction to `canceled` (likely yes) and implement that link if so, or document why they're independent.

## Dependencies
**Depends on:** [01 step-02](../01-admin-auth-rbac-cors/step-02-private-middleware-rbac.md) (admin gate).
**Blocks:** [step-03](./step-03-order-fulfillment-swagger-and-tests.md).

## Implementation notes
- **The state machine is the substance.** Without it, staff (or a UI bug) can set nonsensical statuses; with it, fulfillment is a predictable flow. Keep the transition map small, explicit, and unit-tested.
- Setting `shipped` is the natural trigger for a "your order shipped" email if that's ever wanted — note it as a hook point (not in scope now; there's a checkout-successful email but no shipped email today).
- `trackingUrl` is customer-visible — validate it's a URL and consider restricting schemes to `https`. Don't let arbitrary strings through (a `javascript:` URL rendered in the storefront would be an XSS vector).
- Keep the order↔transaction cancellation relationship explicit to avoid a state where an order is canceled but its transaction still says `shipped`.

## Acceptance criteria
- [ ] An admin can update fulfillment status + tracking URL for an order via a single documented endpoint.
- [ ] Illegal status transitions are rejected; the transition map is unit-tested.
- [ ] `trackingUrl` is validated as an `https` URL.
- [ ] Order cancellation ↔ transaction `canceled` relationship is implemented or explicitly documented as independent.
- [ ] The response reflects the updated fulfillment state.

## References
- `libs/db/shipping-transaction/actions/update.ts` — the unused update action to wrap.
- `libs/entities/shipping-transaction/shipping-transaction-entity.ts` — `ShippingTransactionStatusEnum`, `trackingUrl`.
- `libs/db/order/actions/select.ts` — order detail already joins `shippingTransaction`.
- `libs/modules/order/use-cases/get-order-from-session-result.ts` — initial `processing` creation.
- `functions/private/orders/[id]/cancel/index.ts` — order cancel (relationship to transaction cancel).
