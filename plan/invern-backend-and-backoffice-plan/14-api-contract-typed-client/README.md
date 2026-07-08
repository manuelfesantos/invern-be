# 14 — API Contract & Typed Client

**Status:** Not Started · **Priority:** P0 · **Track:** Backend API Completion

## Summary
`swagger.yaml` is the OpenAPI contract for the API and is the intended source for auto-generating the backoffice's typed client — but it will only be trustworthy if it's kept complete and accurate as Track B adds endpoints, and if it describes auth as it truly works (today it declares a placeholder `X-Admin-Secret-Key` scheme that doesn't match reality). This feature makes the spec authoritative: audits it for completeness against the real routes, adds a CI check that fails when code and spec drift, and publishes a generated typed client the backoffice consumes so its types stay honest against the real API.

## Why this matters
The backoffice's code-quality bar ([§14 of the brief]) rests on a generated client rather than hand-written fetch calls. That only works if the spec is complete and correct — a stale spec produces a confidently-wrong client, which is worse than none. Because every Track B feature adds endpoints, the spec and client need a maintenance discipline, not a one-time pass.

## Goals — what "done" looks like
- `swagger.yaml` matches the real route inventory exactly (every route documented; no phantom routes; auth scheme real).
- Whether the spec is hand-maintained or generated from Zod (`@asteasolutions/zod-to-openapi` is a dependency) is decided and made the single workflow.
- A CI check fails when the spec is out of date relative to the code.
- A typed client is generated from the spec (e.g. `openapi-typescript`) and made available to the backoffice, with a documented regeneration step.
- The pagination envelope, admin security, and all Track B additions are reflected.

## User / business impact
Internal/engineering: the backoffice gets accurate types for free; API changes surface as type errors in the backoffice instead of runtime bugs. Indirectly protects every backoffice screen from contract drift.

## In scope / Out of scope
**In scope:** spec completeness audit; the generate-vs-hand-maintain decision; spec-freshness CI; typed-client generation + publishing/consumption path; keeping it current as Track B lands.
**Out of scope:** the backoffice's use of the client (that's [15](../15-backoffice-scaffolding/README.md)/data layer); public-route contract changes beyond accuracy.

## Dependencies
**Depends on:** the endpoint work whose contracts it captures — [01](../01-admin-auth-rbac-cors/README.md) (auth scheme), [07](../07-pagination-filtering-envelope/README.md) (envelope), [08](../08-shipping-admin-endpoints/README.md)/[09](../09-image-management-upload/README.md)/[10](../10-taxes-admin-surface/README.md)/[11](../11-order-fulfillment-endpoints/README.md)/[12](../12-user-admin-actions/README.md)/[13](../13-admin-dashboard-endpoint/README.md) (new endpoints). It runs **continuously** through Phase 1, absorbing each as it lands.
**Blocks:** [15 — Backoffice Scaffolding](../15-backoffice-scaffolding/README.md) (generates the client) and thus every backoffice screen's typing.

## Steps
| # | Step | Priority | Status | Depends on |
|---|---|---|---|---|
| 01 | [Spec completeness audit & generate-vs-maintain decision](./step-01-spec-completeness-audit.md) | P0 | Not Started | — |
| 02 | [OpenAPI generation & spec-freshness CI check](./step-02-openapi-generation-and-ci-check.md) | P0 | Not Started | step-01 |
| 03 | [Generated typed client for the backoffice](./step-03-typed-client-package.md) | P0 | Not Started | step-02 |

## Key risks
- **Silent drift.** The whole value proposition collapses if the spec lags the code. The CI freshness check is what prevents that — it's the load-bearing step.
- **Generation model mismatch.** If swagger is currently generated from Zod via `@asteasolutions/zod-to-openapi`, hand-editing the YAML would be overwritten; if it's hand-maintained, expecting generation to work is wrong. Step 01 must determine which it is before anything else.

## Relevant existing code
- `swagger.yaml` — the 3965-line spec (53 documented paths); `securitySchemes.AdminSecretKey` placeholder (≈ line 3781); production server `https://api.invernspirit.com`, preview `https://{preview-id}.invern-be.pages.dev`.
- **Verified this session: the spec is *hand-maintained*.** `@asteasolutions/zod-to-openapi` is a declared dev dependency (present in the lockfile) but is **imported nowhere** — no `OpenAPIRegistry`/`extendZodWithOpenApi` usage in `libs`/`functions`/`scripts`. So the brief's implication that swagger is "generated with @asteasolutions/zod-to-openapi" is not currently true; it's a manually-edited YAML, and the tooling is unused. This is the central decision in step-01.
- `package.json` — `@asteasolutions/zod-to-openapi` (dev dep, unused), `swagger-ui-dist`, a `docs` script that serves `./docs` over HTTPS.
- `docs/swagger-ui/**` — a bundled Swagger UI viewer.
- `libs/entities/**` — the Zod schemas a generator would derive from (and that the backoffice forms mirror per brief §14).
- `bruno-collection.json` — an API client collection (secondary contract reference; keep it in mind for drift too).
