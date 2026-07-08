---
status: Not Started
priority: P1
feature: 18-backoffice-catalog
track: backoffice-app
depends_on: ["16-backoffice-auth-shell/step-03", "17-backoffice-design-system/step-02"]
blocks: ["18-backoffice-catalog/step-02"]
---
# Step 01: Products list screen

**Status:** Not Started · **Priority:** P1 · **Feature:** [Catalog Management](./README.md)

## Technical goal
Build the products list screen using the shared `<DataTable>`: paginated, sortable, and filterable against the product list endpoint, with thumbnail, name, price, stock, and collection columns, and row actions (view/edit/delete).

## User impact
Admin staff can browse, search, sort, and find products (including low-stock) and jump to editing or deleting them.

## Current state
- `GET /private/products` returns a paginated envelope after [07 step-02](../07-pagination-filtering-envelope/step-02-retrofit-list-endpoints.md) (today it's a bare array). Product list rows include a thumbnail image, name, price, stock (`libs/db/product/actions/select.ts`).
- The shared table + shell exist ([17 step-02](../17-backoffice-design-system/step-02-data-table-component.md), [16 step-03](../16-backoffice-auth-shell/step-03-app-shell-nav-layout.md)).

## Technical steps
1. Add the products route under the shell nav; define typed columns (thumbnail, name, `priceInCents`→currency display, stock with low-stock badge, collection name, actions).
2. Wire a TanStack Query hook to `GET /private/products` via the typed client, passing the table's page/sort/filter params; render with `<DataTable>`.
3. Filters: name search (text `LIKE`), collection filter, and a low-stock toggle (using the shared threshold from [13](../13-admin-dashboard-endpoint/README.md)/[07 step-03](../07-pagination-filtering-envelope/step-03-filtering-and-sorting.md)). Sort by name/price/stock/createdAt (allow-listed).
4. Row actions: view/edit (→ [step-02](./step-02-product-create-edit-form.md)) and delete (confirm-dialog → `DELETE /private/products/{id}`, then invalidate the query). Surface the image + stock cleanup implications from [03](../03-payment-stock-integrity/README.md)/[09](../09-image-management-upload/README.md) (delete cascades images + R2 objects server-side).
5. A "Create product" primary action → the create form.
6. Loading/empty/error states from [17 step-04](../17-backoffice-design-system/step-04-states-and-accessibility.md).

## Dependencies
**Depends on:** [16 step-03](../16-backoffice-auth-shell/step-03-app-shell-nav-layout.md), [17 step-02](../17-backoffice-design-system/step-02-data-table-component.md).
**Blocks:** [step-02](./step-02-product-create-edit-form.md).

## Implementation notes
- Display stock read-only here with a low-stock badge; editing stock is [22](../22-backoffice-stock/README.md), not this screen (avoid implying stock is editable inline).
- Prices are integer cents server-side — display in currency via the shared money helper ([17 step-03](../17-backoffice-design-system/step-03-forms-layer.md)).
- Deleting a product is destructive and cascades (images/R2, and orders reference product snapshots, not live rows) — confirm clearly; the server handles the cleanup.

## Acceptance criteria
- [ ] The products list renders via `<DataTable>` with server-side pagination/sort/filter.
- [ ] Columns include thumbnail, name, price (currency-formatted), stock (low-stock badge), collection, actions.
- [ ] Name/collection/low-stock filters and allow-listed sorting work.
- [ ] Delete is confirmed and invalidates the list; create/edit navigation works.
- [ ] Loading/empty/error states are handled.

## References
- `apps/backend/src/routes/private/products.ts`, `libs/db/product/actions/select.ts` — the endpoint/list shape.
- [07](../07-pagination-filtering-envelope/README.md) — pagination/sort/filter contract.
- [17 step-02](../17-backoffice-design-system/step-02-data-table-component.md) — `<DataTable>`.
- [22](../22-backoffice-stock/README.md) — where stock is actually edited.
