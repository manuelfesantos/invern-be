---
status: Not Started
priority: P0
feature: 09-image-management-upload
track: backend-api-completion
depends_on: ["09-image-management-upload/step-03"]
blocks: []
---
# Step 04: Image swagger + tests

**Status:** Done · **Priority:** P0 · **Feature:** [Image Management & Upload](./README.md)

## Technical goal
Document the upload + `/private/images` CRUD surface in `swagger.yaml` (including the multipart upload) and add tests for upload validation, association rules, thumbnail uniqueness, and delete-removes-object behavior.

## User impact
None directly; keeps the typed client ([14](../14-api-contract-typed-client/README.md)) accurate and protects the new image surface from regression.

## Current state
- No image admin paths in `swagger.yaml`; no tests (routes are new).
- The upload is `multipart/form-data`, which needs explicit OpenAPI `requestBody` content typing (not the JSON default used elsewhere).

## Technical steps
1. Swagger: document `POST /private/images/upload` with `multipart/form-data` request body (binary file field) and the URL response; document `/private/images` CRUD with the image schema and association fields. Include the admin security scheme.
2. Tests (per [04](../04-testing-quality-gates/README.md)) using the R2 fake from [04 step-01](../04-testing-quality-gates/step-01-jest-scaffolding-and-fakes.md):
   - Upload: valid image type stored + URL returned; disallowed type → 400; oversized → 413; key uniqueness (two uploads of same filename don't collide).
   - CRUD: create record + associate to product; invalid product/collection → 400; update alt/thumbnail; setting a thumbnail unsets siblings; delete removes both the record and the R2 object (assert the fake bucket no longer has the key).
   - Product delete cleans up R2 image objects.
   - Auth: one anonymous/USER rejection case.
3. Confirm the spec-freshness CI check passes.

## Dependencies
**Depends on:** [step-03](./step-03-images-crud-and-association.md).
**Blocks:** None. Feeds [14](../14-api-contract-typed-client/README.md).

## Implementation notes
- The R2 fake must support the image adapter's put/delete so the "delete removes object" assertion is real; extend it if [04](../04-testing-quality-gates/README.md)'s fake only covered stock semantics.
- Testing multipart parsing: construct a `FormData` with a `Blob` in the test and pass a synthetic `Request` to the handler; Node 20 supports `FormData`/`Blob` natively.
- Keep the magic-byte/sniff logic (from [step-02](./step-02-upload-endpoint.md)) unit-tested with tiny fixtures for each allowed type + one spoofed type.

## Acceptance criteria
- [ ] Upload + `/private/images` CRUD fully documented in `swagger.yaml`, including multipart request body and admin security.
- [ ] Tests cover upload validation, association validation, thumbnail uniqueness, and delete-removes-object (record + R2).
- [ ] Product-delete R2 cleanup is tested.
- [ ] Spec-freshness CI check passes.

## References
- `swagger.yaml` — add image paths + multipart body.
- [04 step-01](../04-testing-quality-gates/step-01-jest-scaffolding-and-fakes.md) — R2 fake (extend for images).
- `libs/adapters/r2/images/**`, `functions/private/images/**` — code under test.
- [14](../14-api-contract-typed-client/README.md) — spec/client sync.
