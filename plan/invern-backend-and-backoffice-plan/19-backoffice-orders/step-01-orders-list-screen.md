---
status: Not Started
priority: P1
feature: 19-backoffice-orders
track: backoffice-app
depends_on: ["16-backoffice-auth-shell/step-03", "17-backoffice-design-system/step-02", "07-pagination-filtering-envelope/step-02"]
blocks: ["19-backoffice-orders/step-02"]
---
# Step 01: Orders list screen

**Status:** Not Started · **Priority:** P1 · **Feature:** [Orders & Fulfillment UI](./README.md)

## Technical goal
Build the orders list on the shared `<DataTable>`: paginated, sortable by date, filterable by status/customer/date, with columns for id, date, customer, total, order status, and fulfillment status.

## User impact
Admin staff can find and triage orders — new, processing, shipped, canceled — and open any for detail/fulfillment.

## Current state
- `GET /private/orders` paginates after [07 step-02](../07-pagination-filtering-envelope/step-02-retrofit-list-endpoints.md) (today the use-case drops paging) and supports the existing id-filters + the standard filter contract ([07 step-03](../07-pagination-filtering-envelope/step-03-filtering-and-sorting.md)). Orders include payment + shipping transaction (joined in the select).

## Technical steps
1. Orders route under the shell; typed columns: order id (short), createdAt (date), customer (from personalDetails), total (from payment/computed), order status (canceled vs active), fulfillment status (shipping transaction status badge).
2. Query `GET /private/orders` with page/sort/filter; render via `<DataTable>`.
3. Filters: fulfillment status, canceled, date range, and customer/email search (per [07 step-03](../07-pagination-filtering-envelope/step-03-filtering-and-sorting.md)'s allow-list). Sort by createdAt.
4. Status badges reuse the shared Badge variants ([17 step-01](../17-backoffice-design-system/step-01-owned-component-primitives.md)) mapping the order/fulfillment enums.
5. Row → order detail ([step-02](./step-02-order-detail-screen.md)); no destructive actions in the list (cancel is on detail, deliberate).

## Dependencies
**Depends on:** [16 step-03](../16-backoffice-auth-shell/step-03-app-shell-nav-layout.md), [17 step-02](../17-backoffice-design-system/step-02-data-table-component.md), [07 step-02](../07-pagination-filtering-envelope/step-02-retrofit-list-endpoints.md).
**Blocks:** [step-02](./step-02-order-detail-screen.md).

## Implementation notes
- **Total/customer come from serialized/joined data** — the list endpoint returns orders with payment + shipping transaction joined, but `products`/`personalDetails` are serialized; use the backend's extended shape or compute display fields carefully (don't render raw serialized text).
- Keep cancel off the list (it's destructive and needs context) — do it from detail with confirmation.
- Date filtering is high-value for daily ops ("today's orders") — make sure the backend filter supports a date range ([07 step-03](../07-pagination-filtering-envelope/step-03-filtering-and-sorting.md)).

## Acceptance criteria
- [ ] Orders list renders via `<DataTable>` with server-side pagination/sort/filter.
- [ ] Columns show id, date, customer, total, order + fulfillment status (badges).
- [ ] Status/canceled/date/customer filters and date sort work.
- [ ] Rows link to detail; no inline destructive actions.
- [ ] Loading/empty/error states handled.

## References
- `apps/backend/src/routes/private/orders.ts`, `libs/db/order/actions/select.ts` — list shape (joins payment + shipping transaction).
- [07](../07-pagination-filtering-envelope/README.md) — pagination/filter contract.
- [17 step-01](../17-backoffice-design-system/step-01-owned-component-primitives.md) — status badges.
