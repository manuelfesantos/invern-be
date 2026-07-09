---
status: Done
priority: P0
feature: 09-image-management-upload
track: backend-api-completion
depends_on: ["09-image-management-upload/step-01", "01-admin-auth-rbac-cors/step-02"]
blocks: ["09-image-management-upload/step-03"]
---
# Step 02: Admin image upload endpoint (file → R2 → URL)

**Status:** Done · **Priority:** P0 · **Feature:** [Image Management & Upload](./README.md)

## Technical goal
Add an admin-gated endpoint that accepts an uploaded image file, validates it, stores it in the images R2 bucket with a unique key, and returns the hosted URL — the primitive the backoffice's image picker uses.

## User impact
Admin staff can upload a photo from their browser and get back a URL to attach to a product/collection — no external hosting step.

## Current state
- There is no multipart/form-data or any file-handling code anywhere (verified). Route handlers read JSON via `getBodyFromRequest` (`libs/utils/http/**`).
- The images R2 adapter + bucket exist after [step-01](./step-01-images-bucket-and-binding.md).
- Cloudflare Workers/Pages Functions support `request.formData()` and `Blob`/`File` (via the Fetch API) natively — no extra library needed.

## Technical steps
1. Add `functions/private/images/upload/index.ts` → `onRequestPost` (admin-gated by the `/private` middleware). Parse `request.formData()`, read the file field (a `File`/`Blob`).
2. Validate the upload **before** storing:
   - **Content type** against an allow-list (`image/jpeg`, `image/png`, `image/webp`, `image/avif` — the repo already prefers avif per git history "perf: use avif for big images"). Reject others with `400`.
   - **Size** against a max (e.g. a few MB — pick and document); reject oversized with `413`.
   - **Magic-byte sniff** (optional but recommended): verify the leading bytes match the declared type rather than trusting the client MIME/filename.
3. Generate a safe, unique object key per the [step-01](./step-01-images-bucket-and-binding.md) scheme (UUID + validated extension derived from the sniffed type, **not** the client filename).
4. Store via the images adapter `putImage(key, bytes, contentType)`; set correct `Content-Type` on the R2 object so it serves correctly.
5. Return `{ url: `${IMAGES_HOST}/${key}` }` (and useful metadata: size, contentType). Do **not** create an `imagesTable` record here — association/record creation is [step-03](./step-03-images-crud-and-association.md), so uploading and associating are separable (the UI can upload, preview, then save). Note the orphan-object tradeoff (see notes).
6. Enforce the request size limit and content-type in the handler defensively even if the edge also limits it.

## Dependencies
**Depends on:** [step-01](./step-01-images-bucket-and-binding.md) (bucket/adapter), [01 step-02](../01-admin-auth-rbac-cors/step-02-private-middleware-rbac.md) (admin gate).
**Blocks:** [step-03](./step-03-images-crud-and-association.md).

## Implementation notes
- **Never trust client-supplied filename/MIME.** Derive the stored extension from a server-side content-type check/sniff; a `.png` that's actually an HTML/SVG-with-script must not be stored as servable HTML. If SVG is ever allowed, sanitize it — recommend **not** allowing SVG to avoid stored-XSS via images.
- Worker request body size limits apply; very large images may need the client to resize first (the backoffice can downscale before upload — note for [18](../18-backoffice-catalog/README.md)). Document the max.
- **Orphan objects:** uploading without creating a record can leak objects if the user abandons the flow. Mitigations: (a) accept it and add a periodic sweep of unreferenced keys (follow-up), or (b) make the UI always follow upload with a record-create/delete. Document the choice; a sweep job is out of scope here (note it).
- Consider returning a short-lived, backoffice-only URL vs the permanent public URL — but since catalog images are public anyway, the permanent public URL is fine.

## Acceptance criteria
- [ ] `POST /private/images/upload` accepts a multipart file, admin-gated, and returns the hosted URL.
- [ ] Non-image / disallowed content types are rejected (`400`); oversized files rejected (`413`).
- [ ] The stored object key is unique (UUID-based) and the extension is server-derived, not from the client filename.
- [ ] The R2 object serves with the correct `Content-Type` from `IMAGES_HOST`.
- [ ] SVG handling decision documented (recommend disallow); orphan-object strategy documented.

## References
- `libs/adapters/r2/images/**` — from [step-01](./step-01-images-bucket-and-binding.md).
- `libs/utils/http/**` — existing body/query helpers (JSON today; formData is new here).
- `functions/private/stock/setup/index.ts` — an existing admin POST route pattern (secret-gated) for structure reference.
- `libs/entities/env/index.ts` — `IMAGES_HOST`, `IMAGES_BUCKET`.
- `libs/utils/crypto/uuid.ts` — `getRandomUUID` for keys.
