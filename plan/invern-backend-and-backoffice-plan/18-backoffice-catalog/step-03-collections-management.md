---
status: Not Started
priority: P1
feature: 18-backoffice-catalog
track: backoffice-app
depends_on: ["17-backoffice-design-system/step-02", "17-backoffice-design-system/step-03"]
blocks: []
---
# Step 03: Collections management

**Status:** Not Started · **Priority:** P1 · **Feature:** [Catalog Management](./README.md)

## Technical goal
Build the collections list + create/edit screens (name, description, single collection image) on the shared table/forms layers, since products require a collection.

## User impact
Admin staff can manage the collections products are grouped under, including each collection's image.

## Current state
- `GET/POST /private/collections`, `GET/PUT/DELETE /private/collections/{id}` exist; list is paginated after [07 step-02](../07-pagination-filtering-envelope/step-02-retrofit-list-endpoints.md).
- `insertCollectionSchema` (`libs/entities/collection/collection-entity.ts`): name, description. A collection has **one** image (`collectionsRelations.images = one`; `images.collectionId` unique).

## Technical steps
1. Collections list via `<DataTable>` (name, description snippet, product count if available, image thumbnail, actions).
2. Create/edit form (RHF + Zod mirroring `insertCollectionSchema`): name, description.
3. Collection image: a single-image slot using the image upload UI ([step-04](./step-04-image-upload-ui.md)) constrained to one image (collection cardinality is one). Setting a new image replaces the old.
4. Delete: confirm-dialog → `DELETE /private/collections/{id}`. **Warn about the cascade** — deleting a collection cascades to its products (`products.collectionId` `onDelete: cascade`) and their images. This is a high-impact destructive action; make the consequence explicit in the confirmation.
5. Wire the collection select in the product form ([step-02](./step-02-product-create-edit-form.md)) to this data.

## Dependencies
**Depends on:** [17 step-02](../17-backoffice-design-system/step-02-data-table-component.md), [17 step-03](../17-backoffice-design-system/step-03-forms-layer.md).
**Blocks:** None (but product form's collection select relies on collections existing).

## Implementation notes
- **The delete cascade is dangerous:** removing a collection deletes all its products (and their images/R2 objects). The confirmation must state this plainly (e.g. "This will delete N products and their images") — ideally show the product count. Consider requiring extra confirmation for non-empty collections.
- Collection image is singular — the UI must enforce replace-not-append (unlike products, which have many).
- Keep the form minimal (name/description) — the schema is small.

## Acceptance criteria
- [ ] Collections list renders via `<DataTable>` with actions.
- [ ] Create/edit form mirrors `insertCollectionSchema`; single collection image via the image UI (replace semantics).
- [ ] Delete confirmation explicitly warns about the product/image cascade (ideally with counts).
- [ ] Product form's collection select uses this data.
- [ ] Loading/empty/error states handled.

## References
- `apps/backend/src/routes/private/collections.ts`, `libs/entities/collection/collection-entity.ts` — endpoints + schema.
- `db/schema.ts` — collection→products cascade, collection→image (one).
- [step-04](./step-04-image-upload-ui.md) — image UI (single-image mode).
- [step-02](./step-02-product-create-edit-form.md) — consumer of the collection select.
