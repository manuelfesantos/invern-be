---
status: Not Started
priority: P1
feature: 22-backoffice-stock
track: backoffice-app
depends_on: ["16-backoffice-auth-shell/step-03", "17-backoffice-design-system/step-02"]
blocks: ["22-backoffice-stock/step-02"]
---
# Step 01: Stock overview & low-stock view

**Status:** Not Started · **Priority:** P1 · **Feature:** [Stock Management UI](./README.md)

## Technical goal
Build a stock overview screen listing products with their current stock, highlighting low/out-of-stock items, filterable and sortable by stock, reusing the shared low-stock threshold.

## User impact
Admin staff see at a glance what needs restocking and can jump to adjusting it.

## Current state
- Product stock is on the product row (D1 `products.stock`); the product list already returns it ([07](../07-pagination-filtering-envelope/README.md)). The low-stock threshold is defined once ([13 step-01](../13-admin-dashboard-endpoint/step-01-summary-endpoint.md)).
- The admin stock GET route (`/private/stock/{productId}`) reads from R2 and is **local-only** today; the canonical stock number for display is D1's `products.stock` via the product list.

## Technical steps
1. Stock overview via `<DataTable>` sourced from the product list (name, thumbnail, current stock, low/out badges), or a dedicated stock endpoint if [03](../03-payment-stock-integrity/README.md)/[13](../13-admin-dashboard-endpoint/README.md) exposes one. Reuse the product list query with a stock-focused column set + default sort by stock ascending (lowest first).
2. Filters/sort: low-stock toggle (shared threshold), out-of-stock filter, sort by stock. This overlaps the products list filter ([18 step-01](../18-backoffice-catalog/step-01-products-list-screen.md)) — that's fine; this screen is stock-centric (defaults to worst-first).
3. Row → adjust-stock flow ([step-02](./step-02-adjust-stock-flow.md)).
4. Optionally surface the low-stock list from the dashboard endpoint ([13](../13-admin-dashboard-endpoint/README.md)) as a quick summary at the top.
5. Standard states.

## Dependencies
**Depends on:** [16 step-03](../16-backoffice-auth-shell/step-03-app-shell-nav-layout.md), [17 step-02](../17-backoffice-design-system/step-02-data-table-component.md).
**Blocks:** [step-02](./step-02-adjust-stock-flow.md).

## Implementation notes
- **Show D1 `products.stock` as the authoritative display number** (it's what checkout validates against). The R2/KV stores are cache/source-of-truth plumbing; the admin shouldn't have to reason about three numbers — [03](../03-payment-stock-integrity/README.md) keeps them synced, so one displayed number is correct.
- Reuse the shared low-stock threshold so the dashboard, product list, and this screen agree on "low."
- Default to worst-first ordering so the screen is immediately actionable.

## Acceptance criteria
- [ ] Stock overview lists products with current stock and low/out-of-stock highlighting, default-sorted worst-first.
- [ ] Low/out-of-stock filters use the shared threshold; sort by stock works.
- [ ] Rows link to the adjust-stock flow.
- [ ] The displayed stock is the authoritative (D1) number.
- [ ] Standard states handled.

## References
- `libs/db/product/actions/select.ts` — product/stock reads.
- [13 step-01](../13-admin-dashboard-endpoint/step-01-summary-endpoint.md) — shared low-stock threshold + summary.
- [17 step-02](../17-backoffice-design-system/step-02-data-table-component.md) — `<DataTable>`.
- [step-02](./step-02-adjust-stock-flow.md) — adjust flow linked from here.
