---
status: Not Started
priority: P1
feature: 19-backoffice-orders
track: backoffice-app
depends_on: ["19-backoffice-orders/step-01"]
blocks: ["19-backoffice-orders/step-03"]
---
# Step 02: Order detail screen

**Status:** Not Started · **Priority:** P1 · **Feature:** [Orders & Fulfillment UI](./README.md)

## Technical goal
Build the order detail view rendering the full, parsed order: line items with prices/taxes, customer and shipping address, payment state, and shipping-transaction status/tracking — the read foundation the fulfillment actions ([step-03](./step-03-fulfillment-actions.md)) sit on.

## User impact
Admin staff see everything about an order in one place to make fulfillment/support decisions.

## Current state
- `GET /private/orders/{id}` returns the order (the private detail uses `getOrder(id, false)` → the base order; the extended/client shape with computed prices/taxes is produced by `extend-order.ts`). `products` is serialized; `personalDetails`/`address` are stored (encrypted) — need parsing/extending for display.
- The order joins payment + shipping transaction.

## Technical steps
1. Order detail route (`/orders/:id`); query `GET /private/orders/{id}`.
2. Render sections: header (id, date, order status, fulfillment badge), line items (product name, qty, unit/line price, taxes — from the extended shape), totals (net/gross/tax/shipping), customer (name/email from personalDetails), shipping address, payment (state, method brand/last4), shipping transaction (status, tracking URL if set).
3. Use the extended/client order representation for money/tax display — don't render raw serialized `products` text or raw cents without formatting.
4. Provide the anchor for fulfillment actions ([step-03](./step-03-fulfillment-actions.md)) — a clearly-placed actions area (mark shipped/delivered, add tracking, cancel).
5. Handle not-found/error states; a canceled order shows a clear canceled indicator.

## Dependencies
**Depends on:** [step-01](./step-01-orders-list-screen.md).
**Blocks:** [step-03](./step-03-fulfillment-actions.md).

## Implementation notes
- **Consider exposing the extended order shape to admins.** The private order detail currently returns the base order; the richer computed shape (prices, taxes, statuses) lives in `extend-order.ts` and is used for the public client order. If admin detail lacks computed fields, either compute client-side from the base data or (better) have the backend admin detail return the extended shape — flag this to the [11](../11-order-fulfillment-endpoints/README.md) work if a backend change is needed, rather than duplicating money math in the UI.
- Personal details/address may be encrypted at rest server-side but are returned decrypted in the order detail — confirm the API returns them usable (the extender/DTO handles this) and don't attempt client-side decryption.
- Keep money formatting via the shared helper; taxes/currency come from the order's country.

## Acceptance criteria
- [ ] Order detail renders line items, totals, customer, address, payment, and shipping transaction from the parsed/extended shape.
- [ ] No raw serialized `products` text or unformatted cents are shown.
- [ ] A canceled order is clearly indicated; not-found/error states handled.
- [ ] A clear actions area anchors the fulfillment actions.
- [ ] If admin detail lacks computed fields, the need for a backend extended-shape response is flagged (not worked around with duplicated math).

## References
- `apps/backend/src/routes/private/orders.ts`, `libs/modules/order/use-cases/get-order.ts` — detail endpoint.
- `libs/utils/extender/extend-order.ts` — the extended/client order shape.
- `libs/entities/order/**` — order schemas.
- [step-03](./step-03-fulfillment-actions.md) — actions anchored here.
