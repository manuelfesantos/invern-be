# 09 — Image Management & Upload

**Status:** Not Started · **Priority:** P0 · **Track:** Backend API Completion

## Summary
There is **no image upload mechanism anywhere** in the backend (verified: no multipart/form-data/presigned/upload handling in `functions/**` or `libs/**`). `images.url` is a plain text primary key — something must already be hosting a file before its URL can be referenced. Images are only ever created via `insert-test-data` seeding (`functions/private/insert-test-data/_test-data/images.ts` inserts directly into `imagesTable`); the admin product/collection update payloads don't touch the images relation. For a non-technical user to manage product photos from a browser, the backend needs a real upload flow: an admin endpoint that accepts a file, stores it in R2, and returns a URL, plus `/private/images` CRUD to associate/detach/flag images. This feature builds that from scratch, mirroring the existing R2 adapter pattern used for stock.

## Why this matters
Catalog management is unusable without images, and non-technical staff cannot "already host the file somewhere" and paste a URL — that's the whole point of a backoffice. This is the single largest net-new backend capability the backoffice needs, and it's a hard blocker for the catalog UI.

## Goals — what "done" looks like
- A dedicated R2 bucket (`IMAGES_BUCKET`) is provisioned and bound, with images served over a public `IMAGES_HOST`.
- An admin upload endpoint accepts an image file (with validation), stores it in R2, and returns the hosted URL.
- `/private/images` CRUD manages image records: create (URL + alt + product/collection association + thumbnail flag), update (alt/thumbnail/association), delete (record **and** the underlying R2 object).
- Product/collection detail responses expose their images so the UI can render/manage them.
- Swagger documents the surface; tests cover upload validation and CRUD.

## User / business impact
Admin staff: upload and manage product/collection photos directly from the backoffice ([18](../18-backoffice-catalog/README.md)). Shoppers: correct product imagery (the storefront already renders `images`). Engineers: images stop being a seed-only, hand-edited concern.

## In scope / Out of scope
**In scope:** the R2 image bucket + binding + host; upload endpoint with validation; `/private/images` CRUD; product/collection image exposure; delete-the-object-too semantics; swagger; tests.
**Out of scope:** image transformation/optimization pipelines (Cloudflare Images/resizing) beyond what's trivially needed — note as a follow-up; the storefront's rendering (unchanged); the catalog UI ([18](../18-backoffice-catalog/README.md)).

## Dependencies
**Depends on:** [01](../01-admin-auth-rbac-cors/README.md) (admin gate), [05](../05-configuration-data-hygiene/README.md) step-03 (decides images use a **dedicated** bucket, not the abandoned `COUNTRIES_BUCKET`). Tests per [04](../04-testing-quality-gates/README.md).
**Blocks:** [18 — Catalog Management](../18-backoffice-catalog/README.md) (image-upload UI); reflected in [14](../14-api-contract-typed-client/README.md).

## Steps
| # | Step | Priority | Status | Depends on |
|---|---|---|---|---|
| 01 | [Provision the images R2 bucket, binding & host](./step-01-images-bucket-and-binding.md) | P0 | Not Started | 05-configuration-data-hygiene/step-03 |
| 02 | [Admin image upload endpoint (file → R2 → URL)](./step-02-upload-endpoint.md) | P0 | Not Started | step-01, 01-admin-auth-rbac-cors/step-02 |
| 03 | [`/private/images` CRUD & product/collection association](./step-03-images-crud-and-association.md) | P0 | Not Started | step-02 |
| 04 | [Image swagger + tests](./step-04-image-swagger-and-tests.md) | P0 | Not Started | step-03 |

## Key risks
- **Upload abuse / unvalidated files.** An upload endpoint is an attack surface: enforce content-type allow-list, size limits, and safe key generation. Don't trust the client-supplied filename or MIME type blindly.
- **Orphans in both directions.** A deleted image record must delete the R2 object (else storage leaks); a deleted product cascades its image rows in D1 (`onDelete: "cascade"`) but **not** the R2 objects — handle that. Conversely, uploading then failing to create the record leaves an orphan object.
- **`images.url` is the primary key.** Two images can't share a URL, and changing a URL is really a delete+create. Design keys to be unique (include a UUID) so re-uploading the same filename doesn't collide.

## Relevant existing code
- `libs/adapters/r2/**` — the existing R2 adapter (stock) and lock/cache utils to mirror for image storage (`stock-client.ts` shows the `ENV.STOCK_BUCKET.put/get`, cache-purge pattern).
- `functions/private/stock/[productId]/index.ts` — example of an R2-backed route serving from a bucket via a host.
- `libs/db/image/actions/{insert,update,delete,select}.ts` — image DB actions (exist; used only by seeding today).
- `functions/private/insert-test-data/_test-data/images.ts` — the only current image writer (direct `imagesTable` insert).
- `libs/entities/image/image-entity.ts` — image schema (`url` PK, `alt`, `productId`, `collectionId`, `isThumbnail`).
- `db/schema.ts` — `imagesTable` (+ cascade from products/collections), `product_id_index`.
- `libs/entities/env/index.ts` — `IMAGES_HOST` (already read for email logos; the image serving host).
- `libs/modules/product/use-cases/operations/update-product.ts` — product update (does **not** touch images today).
