# 18 — Catalog Management

**Status:** Done · **Priority:** P1 · **Track:** Backoffice App

## Summary
The backoffice screens for managing the catalog: products (list + create/edit), collections (list + create/edit), and the image-upload UI that attaches photos to products/collections. Built on the shared data-table, forms, and design system ([17](../17-backoffice-design-system/README.md)), against the (now paginated) product/collection endpoints and the new image upload/CRUD API ([09](../09-image-management-upload/README.md)).

## Why this matters
The catalog is the store's core content. Non-technical staff need to add and edit products and collections and manage their imagery from a browser — the single most-used part of a commerce backoffice. It's the first entity area to build because it exercises every shared-layer capability (table, form, image upload, money/units) and validates the foundation.

## Goals — what "done" looks like
- A products list screen (paginated/sortable/filterable, incl. low-stock filter) and a product create/edit form.
- A collections management screen (list + create/edit), including the collection's single image.
- An image-upload UI (upload → preview → attach, set alt, mark thumbnail, remove) integrated into product/collection editing.
- Stock is **not** editable here (it goes through the safe stock path — [22](../22-backoffice-stock/README.md)); the product form reflects that.
- Consistent loading/empty/error states and destructive-action confirmation throughout.

## User / business impact
Admin staff: full catalog management from the UI. Shoppers: accurate products, collections, and imagery.

## In scope / Out of scope
**In scope:** product list + create/edit; collection list + create/edit; image upload/attach UI; wiring to the catalog + image APIs.
**Out of scope:** stock editing ([22](../22-backoffice-stock/README.md)); product variants/search facets (§4); the backend catalog/image APIs themselves ([07](../07-pagination-filtering-envelope/README.md)/[09](../09-image-management-upload/README.md)).

## Dependencies
**Depends on:** [16](../16-backoffice-auth-shell/README.md) (shell/auth), [17](../17-backoffice-design-system/README.md) (table/forms/states), [07](../07-pagination-filtering-envelope/README.md) (paginated product/collection lists), [09](../09-image-management-upload/README.md) (image upload/CRUD), [03 step-02](../03-payment-stock-integrity/step-02-tri-store-stock-consistency.md) (product update excludes stock).
**Blocks:** None (leaf feature).

## Steps
| # | Step | Priority | Status | Depends on |
|---|---|---|---|---|
| 01 | [Products list screen](./step-01-products-list-screen.md) | P1 | Done | 16-backoffice-auth-shell/step-03, 17-backoffice-design-system/step-02 |
| 02 | [Product create/edit form](./step-02-product-create-edit-form.md) | P1 | Done | step-01, 17-backoffice-design-system/step-03, 03-payment-stock-integrity/step-02 |
| 03 | [Collections management](./step-03-collections-management.md) | P1 | Done | 17-backoffice-design-system/step-02, 17-backoffice-design-system/step-03 |
| 04 | [Image upload UI](./step-04-image-upload-ui.md) | P1 | Done | step-02, 09-image-management-upload/step-03 |

## Key risks
- **Stock desync via the product form.** If the product edit form writes `stock`, it desyncs D1/KV/R2 ([03](../03-payment-stock-integrity/README.md)). The form must exclude stock (read-only display, edited via the stock screen). This is the sharpest catalog-specific risk.
- **Image association complexity.** Products have many images with a thumbnail; collections have one. The UI must respect those cardinalities (from [09 step-03](../09-image-management-upload/step-03-images-crud-and-association.md)).

## Relevant existing code / references
- `apps/backend/src/routes/private/products.ts`, `collections.ts` — the endpoints (paginated after [07](../07-pagination-filtering-envelope/README.md)).
- `libs/entities/product/product-entity.ts`, `collection/collection-entity.ts` — the schemas the forms mirror (`insertProductSchema` includes `stock`, `collectionId`, `priceInCents`, `weight`).
- [09](../09-image-management-upload/README.md) — image upload/CRUD API the image UI drives.
- [17](../17-backoffice-design-system/README.md) — table/forms/states the screens compose.
