---
status: Not Started
priority: P0
feature: 09-image-management-upload
track: backend-api-completion
depends_on: ["09-image-management-upload/step-02"]
blocks: ["09-image-management-upload/step-04"]
---
# Step 03: `/private/images` CRUD & product/collection association

**Status:** Not Started · **Priority:** P0 · **Feature:** [Image Management & Upload](./README.md)

## Technical goal
Expose `/private/images` endpoints to create, update, and delete image records (URL + alt + product/collection association + thumbnail flag) over the existing image DB actions, with delete removing the underlying R2 object, and ensure product/collection responses expose their images for the UI to manage.

## User impact
Admin staff can attach an uploaded image to a product or collection, set alt text, mark a thumbnail, reorder/replace, and remove images cleanly.

## Current state
- Image DB actions exist (`getInsertImageAction`, `getUpdateImageAction`, `getDeleteImageAction`, selects) but are used only by seeding (`insert-test-data/_test-data/images.ts`) — no admin route (verified).
- `imagesTable`: PK `url`, `alt` (not null), `productId` (not null, cascade), `collectionId` (unique, nullable, set-null), `isThumbnail` (default false); `product_id_index` on productId (`db/schema.ts`).
- `images.url` being the PK means association is by URL; a product has many images (`imagesRelations`), a collection has one image (`collectionsRelations.images = one`).
- Product update (`operations/update-product.ts`) does **not** touch images; product **detail** select includes images (`getSelectProductByIdAction` with `images`), and product **list** includes one thumbnail image — so reads expose images, writes don't.

## Technical steps
1. Add admin use-cases (`libs/modules/image/**`, new) over the image DB actions: `addImage(body)` (url from [step-02](./step-02-upload-endpoint.md) + alt + productId/collectionId + isThumbnail), `updateImage(url, body)` (alt/isThumbnail/association), `deleteImage(url)`.
2. Routes: `functions/private/images/index.ts` (create; optionally list by product/collection) and `functions/private/images/[...]/index.ts` keyed by URL — note the URL-as-id ergonomics: a URL doesn't sit cleanly in a path segment. **Recommended:** key the record by an opaque id instead. Since `images.url` is the PK, either (a) address images by URL-encoded url in the path/body, or (b) add a surrogate `id` to `imagesTable` (a schema migration) so images have a clean REST id. Decide and document; (b) is cleaner long-term but is a migration — if chosen, coordinate with the storefront which references images by shape, not id.
3. Thumbnail invariant: at most one `isThumbnail = true` per product (the list query orders by `isThumbnail` and takes 1). When setting a thumbnail, unset the others for that product in the same batch. Enforce in the use-case.
4. Delete semantics: `deleteImage` must delete the D1 row **and** the R2 object (via the images adapter `deleteImage(key)` — derive the key from the URL). A product delete cascades image **rows** but not R2 objects — add cleanup: on product delete, enumerate its image keys and delete the objects (extend [03](../03-payment-stock-integrity/README.md)'s `deleteProduct` or do it in the image module). Document the collection case (`set null` on collectionId).
5. Ensure product/collection detail responses expose images for management (they mostly do for reads); confirm the update flow returns the current images so the UI stays in sync.
6. Association rules: `productId` is required by the schema; a collection image uses `collectionId` (unique). Validate that referenced product/collection exist; reject dangling associations with `400`.

## Dependencies
**Depends on:** [step-02](./step-02-upload-endpoint.md) (upload provides the URL).
**Blocks:** [step-04](./step-04-image-swagger-and-tests.md).

## Implementation notes
- **URL-as-primary-key is awkward for REST and for delete cleanup.** Adding a surrogate `id` (option b) removes a class of path-encoding bugs and makes the R2-key derivation explicit (store the object key alongside, not parsed from the public URL). Weigh the migration cost; if kept as URL-PK, be rigorous about URL-encoding in routes and about deriving the R2 key from the URL reliably (the `IMAGES_HOST` prefix stripping must be exact).
- **Deleting the R2 object is mandatory** to avoid storage leaks — this is the counterpart to the upload orphan risk in [step-02](./step-02-upload-endpoint.md). Between them, every object either becomes a referenced record or is swept.
- Keep the thumbnail-uniqueness enforcement server-side; don't rely on the UI to unset the previous thumbnail.
- The collection→image relation is `one` (a collection has a single image); enforce that (updating a collection's image replaces, not appends).

## Acceptance criteria
- [ ] `/private/images` supports create (associate an uploaded URL to a product/collection with alt + thumbnail) and update (alt/thumbnail/association), admin-gated.
- [ ] Deleting an image removes the D1 record **and** the R2 object.
- [ ] Deleting a product cleans up its R2 image objects (not just the D1 rows).
- [ ] At most one thumbnail per product is enforced server-side.
- [ ] Invalid product/collection associations are rejected; the image-id addressing decision (URL vs surrogate) is documented.

## References
- `libs/db/image/actions/{insert,update,delete,select}.ts` — DB actions to wrap.
- `functions/private/insert-test-data/_test-data/images.ts` — how images are currently created (reference).
- `libs/entities/image/image-entity.ts`, `db/schema.ts` — image schema/relations, thumbnail flag, cascades.
- `libs/db/product/actions/select.ts` — how images are read for product list/detail (thumbnail ordering).
- `libs/modules/product/use-cases/delete-product.ts` — product delete (extend for R2 cleanup; also see [03 step-02](../03-payment-stock-integrity/step-02-tri-store-stock-consistency.md)).
- `libs/adapters/r2/images/**` — the delete-object counterpart.
