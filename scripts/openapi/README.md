# OpenAPI spec check (`npm run openapi:check`)

`swagger.yaml` is **hand-maintained** (Feature 14 step-01 decision). This check is
the guardrail that keeps it honest. It runs in CI (`quality-gate.yml`, on every PR
into `preview` and `main`) and you can run it locally any time:

```bash
npm run openapi:check
```

## What it checks

1. **Validity** — `swagger.yaml` is a valid OpenAPI 3.0 document and every `$ref`
   resolves (via `@apidevtools/swagger-parser`). A YAML syntax error or a broken
   ref fails here.
2. **Freshness** — the documented `paths` + methods match the **real Hono route
   inventory** resolved from `apps/backend/src/routes/**`
   (`route-inventory.mjs` follows the `.route()` mount tree from `server.ts`).
   - a route in code with no documented path+method → **undocumented** (fail)
   - a documented path+method with no route → **phantom** (fail)

It does **not** verify request/response *shapes* — that's enforced by review via
[`.claude/rules/api-contract-sync.md`](../../.claude/rules/api-contract-sync.md).

## Adding or changing an endpoint

Per the api-contract-sync rule, in the **same change** as the route:

1. Add/adjust the route under `apps/backend/src/routes/{public,private,stripe}/*.ts`.
2. Update `swagger.yaml` — the `paths` entry (path + method + request/response
   shapes) and any new `components.schemas`. Private operations need
   `security: [ { AdminBearer: [] } ]` at the **operation** level (never the
   path-item level — that's invalid in OpenAPI 3.0).
3. Update the `bruno/` collection (mirror the nearest existing request).
4. Run `npm run openapi:check` — it must pass before you push.

If the check reports drift, it prints exactly which operations are undocumented or
phantom. Reconcile `swagger.yaml` (and Bruno) until it's green.

## Files

- `route-inventory.mjs` — resolves the real route list from the Hono mount tree.
- `check-openapi.mjs` — validates the spec and diffs it against that inventory.
