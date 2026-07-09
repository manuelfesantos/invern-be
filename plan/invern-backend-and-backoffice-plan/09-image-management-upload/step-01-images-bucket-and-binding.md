---
status: Done
priority: P0
feature: 09-image-management-upload
track: backend-api-completion
depends_on: ["05-configuration-data-hygiene/step-03"]
blocks: ["09-image-management-upload/step-02"]
---
# Step 01: Provision the images R2 bucket, binding & host

**Status:** Done · **Priority:** P0 · **Feature:** [Image Management & Upload](./README.md)

## Technical goal
Create and bind a dedicated R2 bucket for product/collection images, exposed for public read over `IMAGES_HOST`, and add the adapter scaffolding to put/get/delete image objects — the storage foundation the upload endpoint builds on.

## User impact
None directly; sets up where uploaded images live and how they're served to the storefront/backoffice.

## Current state
- Only one R2 bucket is bound: `STOCK_BUCKET` (`wrangler.toml`). The `Env` declares an abandoned `COUNTRIES_BUCKET` with no binding — [05 step-03](../05-configuration-data-hygiene/step-03-remove-dead-turso-and-countries-bucket.md) removes it and records that images get a **dedicated** bucket, not that one.
- `IMAGES_HOST` already exists in `Env` and is read for email logo URLs — it's a host string, with no bucket behind it for uploaded catalog images yet. Confirm whether `IMAGES_HOST` currently points at an existing asset host (e.g. where `logo.png` lives) and decide whether catalog images share it or get their own subdomain.
- The R2 adapter pattern is established by stock (`libs/adapters/r2/stock/stock-client.ts`): `ENV.<BUCKET>.put/get/delete`, plus cache utilities and a public host.

## Technical steps
1. Provision an R2 bucket for images (per environment: local/preview/production) and add the binding to `wrangler.toml`, e.g. `IMAGES_BUCKET`. Add `IMAGES_BUCKET: R2Bucket` to `Env`. (Coordinate with [05 step-05](../05-configuration-data-hygiene/step-05-wrangler-config-and-readme.md), which versions `wrangler.toml`.)
2. Decide the public-serving model and document it:
   - **(a)** R2 public bucket / custom domain → objects served directly at `IMAGES_HOST/<key>`.
   - **(b)** A Worker route that streams from the bucket (like `stock/[productId]`) — more control (auth, headers) but more code and cost.
   - Recommended: **(a)** a public R2 custom domain for read (catalog images are public anyway), with `IMAGES_HOST` pointing at it. Reserve (b) only if access control on images is ever needed.
3. Add an images R2 adapter (`libs/adapters/r2/images/**`) mirroring `stock-client.ts`: `putImage(key, bytes, contentType)`, `deleteImage(key)`, and (if serving via Worker) `getImage(key)`. Reuse the cache-purge helper (`getCacheKey`/`purgeCache`) so updates invalidate the CDN cache, as stock does.
4. Define the object-key scheme: `products/<productId>/<uuid>.<ext>` or `images/<uuid>.<ext>` — include a UUID to guarantee uniqueness (since `images.url` is a PK and filenames can collide). Document it.
5. Confirm `IMAGES_HOST` value per environment and add to `.env.example`/docs ([05 step-01](../05-configuration-data-hygiene/step-01-env-drift-reconciliation.md)).

## Dependencies
**Depends on:** [05 step-03](../05-configuration-data-hygiene/step-03-remove-dead-turso-and-countries-bucket.md) (dedicated-bucket decision).
**Blocks:** [step-02](./step-02-upload-endpoint.md).

## Implementation notes
- **Don't reuse `STOCK_BUCKET`** — stock objects and image blobs have different lifecycles, access patterns, and public exposure. A separate bucket keeps concerns clean and public-read scoping safe (you do *not* want stock objects publicly readable).
- Public read for images is appropriate (they're shown on the storefront), but ensure the bucket doesn't allow public **write/list** — only the Worker (with the binding) writes.
- Provisioning the actual Cloudflare bucket + custom domain is an infra action (dashboard/`wrangler r2 bucket create`), not just code — capture it in the runbook ([06 step-04](../06-observability-ops-readiness/step-04-ops-runbook.md)). This plan step covers the code/binding; the human operator runs the provisioning command.
- Per §15, this plan does not run provisioning; the step documents exactly what to run.

## Acceptance criteria
- [ ] A dedicated images bucket is bound (`IMAGES_BUCKET`) in `wrangler.toml` and `Env`, per environment.
- [ ] The public serving model is chosen and documented; `IMAGES_HOST` resolves to it.
- [ ] An images R2 adapter exists with put/delete (and get if serving via Worker), reusing the cache-purge pattern.
- [ ] The object-key scheme guarantees uniqueness (UUID-based) and is documented.
- [ ] Bucket allows public read but not public write/list; provisioning steps captured in the runbook.

## References
- `libs/adapters/r2/stock/stock-client.ts` — the adapter pattern to mirror (put/get/delete + cache purge).
- `functions/private/stock/[productId]/index.ts` — Worker-serves-from-bucket example (option b).
- `wrangler.toml` — bucket bindings (add `IMAGES_BUCKET`).
- `libs/entities/env/index.ts` — add `IMAGES_BUCKET`; `IMAGES_HOST` already present.
- [05 step-03](../05-configuration-data-hygiene/step-03-remove-dead-turso-and-countries-bucket.md) — dedicated-bucket decision.
