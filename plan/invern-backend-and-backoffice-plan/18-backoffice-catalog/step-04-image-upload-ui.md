---
status: Not Started
priority: P1
feature: 18-backoffice-catalog
track: backoffice-app
depends_on: ["18-backoffice-catalog/step-02", "09-image-management-upload/step-03"]
blocks: []
---
# Step 04: Image upload UI

**Status:** Not Started · **Priority:** P1 · **Feature:** [Catalog Management](./README.md)

## Technical goal
Build the image-management UI used in product and collection editing: upload a file (with client-side validation + optional downscale), preview it, attach it to the entity with alt text and thumbnail flag, reorder/replace, and remove — driving the upload + `/private/images` CRUD API ([09](../09-image-management-upload/README.md)).

## User impact
Non-technical staff upload and manage product/collection photos directly, with previews and clear controls — the capability that didn't exist at all before.

## Current state
- Backend provides `POST /private/images/upload` (file → URL) and `/private/images` CRUD with product/collection association + thumbnail rules ([09 step-02/03](../09-image-management-upload/step-02-upload-endpoint.md)).
- Products have many images (one thumbnail); collections have one image.

## Technical steps
1. Build an image dropzone/upload control: select or drag a file, validate client-side (type/size matching the backend allow-list, to fail fast before upload), optionally **downscale large images client-side** (the backend has size limits; resizing before upload improves UX and avoids 413s), then `POST` to the upload endpoint and receive the URL.
2. On upload success, create the image record (`POST /private/images`) associating it to the product/collection, with an alt-text field (required by the schema) and a thumbnail toggle (products).
3. Gallery management (products): show current images, allow setting the thumbnail (one-at-a-time — the backend enforces uniqueness; reflect it in the UI), editing alt text, reordering if supported, and removing (confirm → `DELETE /private/images/...`, which also deletes the R2 object server-side).
4. Single-image mode (collections): one slot; uploading replaces the existing image.
5. Handle the upload/associate two-step: uploading yields a URL but the record is created separately ([09 step-02](../09-image-management-upload/step-02-upload-endpoint.md) leaves record creation to CRUD). Make the UX atomic from the user's view (upload → auto-create record, or explicit "save"), and handle the orphan case (uploaded-but-not-saved) per [09](../09-image-management-upload/README.md)'s decision.
6. States: upload progress, per-image loading/error, empty ("no images yet"), and alt-text validation.

## Dependencies
**Depends on:** [step-02](./step-02-product-create-edit-form.md) (needs an existing product id to associate), [09 step-03](../09-image-management-upload/step-03-images-crud-and-association.md).
**Blocks:** None.

## Implementation notes
- **Client-side downscale is worth it:** it sidesteps the backend size limit ([09 step-02](../09-image-management-upload/step-02-upload-endpoint.md)), reduces upload time, and improves the non-technical UX. Use a canvas/`createImageBitmap` resize before upload; keep quality reasonable (prefer webp/avif to match the backend's format preference).
- **Alt text is required** by the schema — enforce it in the UI (accessibility + storefront correctness).
- Respect cardinalities: products many-with-one-thumbnail; collections exactly one. The UI must not let a user violate them (the backend also enforces, but good UX prevents the error).
- Deleting an image is destructive (removes the R2 object too) — confirm.
- Mind the orphan-object tradeoff from [09 step-02](../09-image-management-upload/step-02-upload-endpoint.md): prefer a flow where upload is immediately followed by record creation, or clean up on cancel.

## Acceptance criteria
- [ ] Staff can upload an image (with client-side validation + downscale), preview it, and attach it with alt text.
- [ ] Product galleries support setting one thumbnail, editing alt, and removing images (deleting the R2 object).
- [ ] Collection image is single-slot with replace semantics.
- [ ] The upload→associate flow is atomic from the user's perspective; orphans are handled.
- [ ] Upload progress and per-image loading/error/empty states are handled.

## References
- [09 step-02](../09-image-management-upload/step-02-upload-endpoint.md), [09 step-03](../09-image-management-upload/step-03-images-crud-and-association.md) — upload + CRUD API, cardinalities, thumbnail rules.
- `libs/entities/image/image-entity.ts` — image schema (alt required, thumbnail).
- [step-02](./step-02-product-create-edit-form.md)/[step-03](./step-03-collections-management.md) — where this UI is embedded.
