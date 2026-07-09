# Feature 14 · Step 01 — Spec-vs-code audit findings

**Date:** 2026-07-09 · **Author:** SPIRIT-114 · **Method:** resolved the real Hono
route tree (`apps/backend/src/routes/**`, following `.route()` mounts from
`server.ts`) and diffed it against `swagger.yaml` paths+methods. Scripts:
`scratchpad/route-inventory.mjs`, `scratchpad/swagger-diff.mjs`.

> **Note on the plan's references:** step-01 said to enumerate routes from
> `functions/**`. That is **stale** — the repo migrated to Hono; routes now live
> in `apps/backend/src/routes/**`. Two other "current state" claims were also
> already fixed before this audit: the auth scheme is already `AdminBearer` (JWT),
> not the `AdminSecretKey` placeholder; and `bruno-collection.json` no longer
> exists (replaced by the `bruno/` directory collection).

## Result

**Before:** 91 real ops / 90 documented (6 undocumented, 5 phantom/mismatched).
**After:** **91 real ops / 91 documented · 63 paths each · 0 missing · 0 phantom.**
The spec now matches the code exactly.

## Drift found & how it was resolved

| # | Type | Finding | Resolution |
|---|------|---------|------------|
| 1 | ⚠ Security + mis-placement | Collection **create/update/delete lived under `/public/.../collections`** with **no auth** (no router middleware, no upstream gate beyond `countryContext`, no role check in the use-cases). Swagger documented detail/update/delete under `/private/collections/{id}` (which had no route). | **Route fix (user-approved):** removed `POST`/`PUT`/`DELETE` from `public/collections.ts` (kept `GET` list + `GET /:id` for storefront SSG); added `GET /:id`, `PUT /:id`, `DELETE /:id` to `private/collections.ts`. Code converged to what swagger **and** Bruno already documented → **zero swagger churn** for collections. |
| 2 | Wrong method | Cart item edit is `PUT /public/.../cart/items/{id}`; spec documented a phantom `PATCH` alongside it. | Removed the `patch:` operation + its orphaned `CartItemQuantityInputPatch` schema. |
| 3 | Phantom | `POST /private/check-expired-sessions` — no such route or cron handler exists. | Replaced with the three real maintenance routes. |
| 4 | Missing | `DELETE /private/expired/{carts,sessions,users}` (mounted from `maintenance.ts`) were undocumented. | Documented all three (`Private - Scheduled Tasks` tag, `AdminBearer`, `{ message }` response). |
| 5 | Stale ref | `AdminBearer` description cited `functions/private/_middleware.ts`. | Updated to `apps/backend/src/middleware/require-admin.ts`. |
| 6 | Server URLs | Local port `8788` (real dev port is `8790`); preview URL was a Cloudflare **Pages** placeholder (app is now a **Worker**). | Local → `8790`; preview → templated `*.workers.dev` server var with a description noting the Workers migration + pending `invern-spirit` rename. Production `https://api.invernspirit.com` unchanged. |

## Decisions

### Spec workflow: **hand-maintain + CI freshness check** (option b)
`swagger.yaml` stays hand-edited, enforced by the existing
[`.claude/rules/api-contract-sync.md`](../../../.claude/rules/api-contract-sync.md)
rule (every contract change updates swagger + Bruno in the same change) plus a CI
freshness check ([step-02](./step-02-openapi-generation-and-ci-check.md)).

Rationale: the api-contract-sync discipline is already in force and has kept the
Track B additions (08/09/11) accurate. Adopting Zod generation
(`@asteasolutions/zod-to-openapi`, a declared but **unused** dev dep) would be a
large annotation effort and would discard the hand-written spec. Option (b) with
a real CI check gives most of the drift protection for a fraction of the cost.
The unused `@asteasolutions/zod-to-openapi` dependency can be removed as cleanup.

### Ownership rule
**Endpoint features own their spec *content*; Feature 14 owns the *mechanism*.**
Each Track B feature's "swagger + Bruno + tests" step is authoritative for its own
routes (per the api-contract-sync rule); Feature 14 provides the freshness check
(step-02) and the generated typed client (step-03), and does not re-document
endpoints the feature owners are responsible for.

### Bruno contract
`bruno-collection.json` is already gone; the `bruno/` directory collection is the
single runnable contract, kept in sync by the api-contract-sync rule. This audit
pruned its two phantom requests (`Public/Cart/Patch Cart Item`,
`Private/Maintenance/Check Expired Sessions`); `Private/Collections` already had
the full CRUD set pointing at the real `/private/collections/{id}` routes.

## Pagination envelope
List responses already share `PageParam`/`PageSizeParam`/`SortOrderParam`
parameters and a consistent `{ data, page, pageSize, total }` body. Extracting a
single reusable `PaginatedResponse` **schema** (vs the current per-endpoint inline
shape) is deferred to step-02 alongside the freshness tooling — it's a
non-behavioral refactor and doesn't affect the code↔spec match established here.

## Acceptance criteria
- [x] Documented spec-vs-code diff; missing/phantom/mismatched routes listed (above).
- [x] Generate-vs-maintain decision made & recorded (hand-maintain + CI, rationale above).
- [x] Admin auth scheme (already `AdminBearer`; stale path ref fixed), server URLs corrected. Pagination-envelope **schema** extraction deferred to step-02 (noted).
- [x] "Endpoint features own content; Feature 14 owns mechanism" rule documented.
- [x] `bruno-collection.json` fate decided (already replaced by `bruno/`; kept in sync by the rule).
