---
status: Done
priority: P0
feature: 14-api-contract-typed-client
track: backend-api-completion
depends_on: ["14-api-contract-typed-client/step-01"]
blocks: ["14-api-contract-typed-client/step-03"]
---
# Step 02: OpenAPI generation & spec-freshness CI check

**Status:** Done · **Priority:** P0 · **Feature:** [API Contract & Typed Client](./README.md)

> **Outcome (SPIRIT-114):** hand-maintain + freshness check (option b). Added
> `npm run openapi:check` (`scripts/openapi/`): validates `swagger.yaml` as OpenAPI
> 3.0 (`@apidevtools/swagger-parser`) and diffs its paths/methods against the real
> Hono route inventory resolved from `apps/backend/src/routes/**` — fails on any
> undocumented or phantom operation. Wired into `quality-gate.yml` (runs on PRs to
> `preview` and `main`). Fixed pre-existing spec issues so the validator starts
> green: 21 invalid path-item-level `security` blocks relocated to operation level,
> one corrupt `carts/{id}` delete response. Verified: validator green, freshness
> green (91 ops / 63 paths), negative tests fail as expected (exit 1), type-check
> clean. Runbook: `scripts/openapi/README.md`.
>
> Also done: reusable `PaginationMeta` schema. The 7 admin list 200 responses that
> under-documented the envelope (`data: [T]` instead of `{ data: [T], page,
> pageSize, total }`) now use `allOf: [PaginationMeta, { data: [T] }]`;
> shipping/methods converted from its inline envelope to the same schema, so all 8
> admin lists share one `PaginationMeta` (one clean type in the generated client).
> Non-paginated lists (e.g. public `/countries`) left as plain arrays.

## Technical goal
Implement whichever spec workflow step-01 chose, and add a CI check that fails when `swagger.yaml` is out of date relative to the code — the guardrail every Track B "swagger + tests" step relies on.

## User impact
None directly; makes contract drift a build failure instead of a silent backoffice bug.

## Current state
- Spec is hand-maintained with no freshness enforcement — nothing catches an endpoint added without a spec update.
- CI (`validate-pr-to-preview.yml`) runs lint/test/typecheck but no spec check.

## Technical steps
1. **If step-01 chose generation (a):** add a `npm run generate:openapi` script that produces `swagger.yaml` from the annotated Zod registry, and a CI job that runs it and `git diff --exit-code swagger.yaml` — failing if the committed spec differs from the generated one. This makes the spec provably current.
2. **If step-01 chose hand-maintenance (b):** add a check that approximates freshness — e.g. a script that enumerates route files and asserts each has a corresponding documented path in `swagger.yaml` (path + method presence, at minimum), failing CI on any undocumented route. It won't catch shape drift, but it catches missing endpoints, which is the common failure.
3. Wire the check into both `validate-pr-to-preview.yml` and `validate-pr-to-main.yml` (per [04 step-03](../04-testing-quality-gates/step-03-extend-main-ci-gate.md)).
4. Validate the spec itself parses (run an OpenAPI validator, e.g. `swagger-cli validate` / `redocly lint`) so a malformed spec fails fast.
5. Document the workflow in the README/runbook: how to regenerate or update the spec when adding an endpoint, so every Track B swagger step follows the same path.

## Dependencies
**Depends on:** [step-01](./step-01-spec-completeness-audit.md) (decision + corrected spec).
**Blocks:** [step-03](./step-03-typed-client-package.md); referenced by every Track B feature's "swagger + tests" step.

## Implementation notes
- **The freshness check is the load-bearing piece.** Without it, the spec (and therefore the generated client) rots. Prefer the generation-based diff check (option a) because it catches shape drift, not just missing paths.
- Keep the check fast; it runs on every PR.
- If the OpenAPI validator flags pre-existing issues in the 3965-line spec, fix or explicitly baseline them so the check starts green.

## Acceptance criteria
- [x] The chosen spec workflow (generate or maintain) is implemented with a runnable script. → `npm run openapi:check`
- [x] A CI check fails when the spec is out of date (undocumented-route/phantom detection for (b)). → verified (exit 1 on drift)
- [x] The spec passes an OpenAPI validator in CI. → `@apidevtools/swagger-parser` strict validate
- [x] The check runs on PRs into both `preview` and `main`. → added to the shared `quality-gate.yml`
- [x] The "how to update the spec when adding an endpoint" workflow is documented. → `scripts/openapi/README.md`

## References
- `swagger.yaml` — the spec under check.
- `.github/workflows/validate-pr-to-preview.yml`, `validate-pr-to-main.yml` — where the check is wired ([04 step-03](../04-testing-quality-gates/step-03-extend-main-ci-gate.md)).
- `package.json` — where the `generate:openapi`/validation scripts go.
- [step-01](./step-01-spec-completeness-audit.md) — the decision this implements.
