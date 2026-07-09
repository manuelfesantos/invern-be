---
status: Done
priority: P0
feature: 14-api-contract-typed-client
track: backend-api-completion
depends_on: []
blocks: ["14-api-contract-typed-client/step-02"]
---
# Step 01: Spec completeness audit & generate-vs-maintain decision

**Status:** Done · **Priority:** P0 · **Feature:** [API Contract & Typed Client](./README.md)

> **Outcome (SPIRIT-114):** see [AUDIT.md](./AUDIT.md). Spec now matches code exactly
> (91 ops / 63 paths, 0 missing, 0 phantom). Decision: **hand-maintain + CI check**.
> Fixed: unauthenticated public collection writes moved to `/private/collections`
> (GET stays public for SSG), cart `PATCH` phantom removed, 3 real `/private/expired/*`
> maintenance routes documented, stale auth-scheme path ref, server URLs. Bruno pruned
> of its 2 phantom requests. Verified: type-check + lint + 127 tests + live curl.

## Technical goal
Audit `swagger.yaml` against the real route inventory, correct the auth scheme and any drift, and decide whether the spec will be **hand-maintained (with a freshness check)** or **generated from Zod** — then commit to that one workflow.

## User impact
None directly; establishes the trustworthy contract the backoffice client is generated from.

## Current state
- `swagger.yaml` is **hand-maintained** — `@asteasolutions/zod-to-openapi` is installed but imported nowhere (verified). So the YAML is edited by hand and can drift from code silently.
- The admin security scheme is a placeholder (`AdminSecretKey` / `X-Admin-Secret-Key`) that doesn't match reality (there's no such header check; after [01](../01-admin-auth-rbac-cors/README.md) it's JWT + role).
- 53 paths are documented; Track B adds shipping, images, taxes, fulfillment, dashboard, user-admin, and pagination envelopes — none present yet.
- `bruno-collection.json` is a second, separate contract artifact that can also drift.

## Technical steps
1. Diff the spec against the code: enumerate actual routes (`functions/**` exports of `onRequestGet/Post/Put/Delete`) and compare to `swagger.yaml` paths. List missing routes, phantom routes, and mismatched request/response shapes.
2. Decide the workflow (pick one, document the rationale):
   - **(a) Adopt Zod generation** using the already-installed `@asteasolutions/zod-to-openapi`: register the `libs/entities/**` Zod schemas + route metadata and generate `swagger.yaml`. Pro: the spec can't drift from the schemas, and the backoffice forms (which mirror the same Zod per brief §14) share one source of truth. Con: upfront work to annotate routes/schemas; the file becomes generated (no hand edits).
   - **(b) Keep hand-maintaining** but add a strong freshness check ([step-02](./step-02-openapi-generation-and-ci-check.md)) and a per-endpoint checklist so new routes must update the spec. Pro: less upfront work. Con: relies on discipline; drift is always one forgetful PR away.
   - Recommended: **(a)** if the team will invest once — it structurally guarantees accuracy and pairs with the backoffice's Zod-mirroring goal. If time-constrained, **(b)** with a real CI check is acceptable.
3. Correct the auth scheme to match [01](../01-admin-auth-rbac-cors/README.md) (JWT bearer/cookie for `/private/*`; separate secret scheme only for the machine/maintenance routes if retained).
4. Fix the server URLs (production `https://api.invernspirit.com`; parameterize the preview URL properly) and the pagination envelope component (from [07](../07-pagination-filtering-envelope/README.md)) as a reusable schema.
5. Establish the rule that **every Track B feature's swagger step is authoritative** (each already has a "swagger + tests" step) — this feature owns the *mechanism*; the endpoint features own their *content*.

## Dependencies
**Depends on:** None (audit can start now); content converges as Track B lands.
**Blocks:** [step-02](./step-02-openapi-generation-and-ci-check.md).

## Implementation notes
- **Decide (a) vs (b) before Track B's swagger steps proliferate** — otherwise each feature hand-edits YAML that you later replace with generation, wasting the effort. This step should land early in Phase 1.
- If choosing (a), the migration is: annotate schemas incrementally, generate, and diff against the current hand-written spec to catch discrepancies (the diff itself is a great audit of existing drift).
- Keep `bruno-collection.json` in sync or explicitly deprecate it in favor of the OpenAPI spec + generated client — two drifting contracts is worse than one.

## Acceptance criteria
- [x] A documented diff of spec-vs-code exists; missing/phantom/mismatched routes are listed. → [AUDIT.md](./AUDIT.md)
- [x] The generate-vs-maintain decision is made and recorded, with rationale. → hand-maintain + CI (step-02)
- [x] The admin auth scheme, server URLs, and pagination envelope in the spec are corrected. → auth already `AdminBearer` (stale path ref fixed); servers fixed; envelope-schema extraction deferred to step-02 (noted in AUDIT.md)
- [x] The "endpoint features own spec content; this feature owns the mechanism" rule is documented. → [AUDIT.md](./AUDIT.md)
- [x] `bruno-collection.json`'s fate (sync vs deprecate) is decided. → already replaced by `bruno/` dir, synced by the api-contract rule

## References
- `swagger.yaml` — the spec to audit.
- `package.json` — the unused `@asteasolutions/zod-to-openapi` (enabler for option a).
- `functions/**` — real route inventory to diff against.
- `libs/entities/**` — Zod schemas (generation source for option a; form source for the backoffice).
- `bruno-collection.json` — secondary contract artifact.
- [01](../01-admin-auth-rbac-cors/README.md), [07](../07-pagination-filtering-envelope/README.md) — auth scheme + envelope to encode.
