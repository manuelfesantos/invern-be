---
status: Not Started
priority: P0
feature: 14-api-contract-typed-client
track: backend-api-completion
depends_on: ["14-api-contract-typed-client/step-01"]
blocks: ["14-api-contract-typed-client/step-03"]
---
# Step 02: OpenAPI generation & spec-freshness CI check

**Status:** Not Started · **Priority:** P0 · **Feature:** [API Contract & Typed Client](./README.md)

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
- [ ] The chosen spec workflow (generate or maintain) is implemented with a runnable script.
- [ ] A CI check fails when the spec is out of date (generated-diff for (a); undocumented-route detection for (b)).
- [ ] The spec passes an OpenAPI validator in CI.
- [ ] The check runs on PRs into both `preview` and `main`.
- [ ] The "how to update the spec when adding an endpoint" workflow is documented.

## References
- `swagger.yaml` — the spec under check.
- `.github/workflows/validate-pr-to-preview.yml`, `validate-pr-to-main.yml` — where the check is wired ([04 step-03](../04-testing-quality-gates/step-03-extend-main-ci-gate.md)).
- `package.json` — where the `generate:openapi`/validation scripts go.
- [step-01](./step-01-spec-completeness-audit.md) — the decision this implements.
