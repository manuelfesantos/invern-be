---
status: Done
priority: P0
feature: 11-order-fulfillment-endpoints
track: backend-api-completion
depends_on: []
blocks: ["11-order-fulfillment-endpoints/step-03"]
---
# Step 01: Fix the order-update message & define update vs cancel semantics

**Status:** Done · **Priority:** P0 · **Feature:** [Order & Fulfillment Endpoint Improvements](./README.md)

## Technical goal
Correct the mislabeled `PUT /private/orders/{id}` response and constrain the update to a safe, explicit set of admin-mutable fields, so it stops being both misleading and financially dangerous — and so its role is distinct from `/cancel` and the new fulfillment endpoint.

## User impact
Admin staff: order edits report accurately and can't accidentally corrupt payment/product data. Shoppers: order records stay trustworthy.

## Current state
- `functions/private/orders/[id]/index.ts` `onRequestPut` returns `successResponse.OK("Order cancelled successfully", order)` for **every** update — a copy-paste from the `/cancel` route (verified).
- `libs/modules/order/use-cases/update-order.ts` does `insertOrderSchema.parse(body)` then `getUpdateOrderAction(orderId, orderUpdate)` — i.e. it accepts and can write the entire order shape, including `stripeId`, `userId`, `paymentId`, `shippingTransactionId`, `products` (serialized), `address`, `country`, `personalDetails`, `isCanceled`.
- The dedicated `/cancel` route + `cancelOrder` correctly set only `isCanceled: true`.

## Technical steps
1. Fix the message immediately: return an accurate `"Order updated successfully"` (and only "cancelled" from the actual cancel route).
2. Constrain mutability. Define an **admin order-update schema** that whitelists only fields it's safe for staff to change on an existing (often paid) order. Candidates: `address`, `personalDetails` (correcting a delivery typo), maybe `shippingMethod` label. Explicitly **exclude**: `stripeId`, `paymentId`, `products`, `userId`, `shippingTransactionId`, computed amounts. `isCanceled` should go through `/cancel`, not the generic update. Document the rationale.
3. Replace `insertOrderSchema.parse(body)` in `update-order.ts` with the constrained schema (`.pick`/dedicated Zod object), so out-of-scope fields are rejected (or ignored) rather than written.
4. Decide and document the relationship of the three order-write paths:
   - `/cancel` → sets `isCanceled` (keep).
   - `PUT /{id}` → limited field corrections (this step).
   - Fulfillment status/tracking → the new endpoint in [step-02](./step-02-fulfillment-status-endpoint.md) (not on the order row itself; on the shipping transaction).
   Make sure they don't overlap confusingly.
5. Consider audit/traceability: order edits are sensitive; at minimum log (redacted) what changed by whom (ties to [06 step-01](../06-observability-ops-readiness/step-01-pii-safe-logging.md) redaction and the deferred admin-audit-log follow-up).

## Dependencies
**Depends on:** None.
**Blocks:** [step-03](./step-03-order-fulfillment-swagger-and-tests.md).

## Implementation notes
- **This is a security/data-integrity fix, not just a string change.** The message is the visible bug; the unrestricted field write is the dangerous one. Fix both in the same PR so the endpoint is genuinely backoffice-safe.
- Editing `address`/`personalDetails` on an order that's already been fulfilled has real-world implications (package already shipped to the old address). The UI should reflect that, but the API should at least allow the correction; note the caveat.
- If product/amount corrections are ever genuinely needed (e.g. manual adjustment), that's a separate, deliberately-designed flow with payment implications — out of scope here; do not enable it via the generic update.

## Acceptance criteria
- [ ] `PUT /private/orders/{id}` returns an accurate "updated" message.
- [ ] The update accepts only a documented whitelist of mutable fields; attempts to change `stripeId`/`paymentId`/`products`/etc. are rejected or ignored (test-proven).
- [ ] The roles of `/cancel`, `PUT /{id}`, and the fulfillment endpoint are documented and non-overlapping.
- [ ] Order edits are logged (redacted) for traceability.

## References
- `functions/private/orders/[id]/index.ts` — the hardcoded message.
- `libs/modules/order/use-cases/update-order.ts` — the unrestricted update.
- `libs/modules/order/use-cases/cancel-order.ts`, `functions/private/orders/[id]/cancel/index.ts` — the narrow cancel.
- `libs/entities/order/order-entity.ts` — `insertOrderSchema` (to constrain from).
- `db/schema.ts` — `ordersTable` fields (which are snapshots/immutable).
