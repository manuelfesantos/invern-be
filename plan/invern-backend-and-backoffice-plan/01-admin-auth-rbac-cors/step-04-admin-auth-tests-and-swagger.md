---
status: Done
priority: P0
feature: 01-admin-auth-rbac-cors
track: backend-hardening
depends_on: ["01-admin-auth-rbac-cors/step-02", "04-testing-quality-gates/step-01"]
blocks: []
---
# Step 04: Auth swagger scheme + rejection tests

**Status:** Done · **Priority:** P0 · **Feature:** [Admin Authentication, RBAC & CORS](./README.md)

## Technical goal
Make `swagger.yaml` describe the *real* admin auth scheme (JWT bearer/cookie, not the placeholder `X-Admin-Secret-Key`), and add automated tests proving the `/private` middleware rejects anonymous and non-admin callers and admits admins.

## User impact
None directly — but the swagger accuracy feeds the backoffice's generated typed client (feature 14), and the tests prevent a regression that would silently re-open the admin hole.

## Current state
- `swagger.yaml` defines a `securitySchemes.AdminSecretKey` (`apiKey` in header `X-Admin-Secret-Key`) — a placeholder that does **not** match how auth actually works (there is no such header check today, and after step 2 auth is JWT + role).
- There are **zero** test files in the repo, so there is no test proving the gate works.

## Technical steps
1. Update `swagger.yaml` security schemes to reflect reality after step 2: a bearer/JWT scheme (and/or the refresh-token cookie), applied to all `/private/*` paths via `security:`. Remove or correct `AdminSecretKey` (keep a separate secret scheme only for the machine/maintenance routes if step 2 chose to keep them secret-gated). This is generated with `@asteasolutions/zod-to-openapi` elsewhere — check whether swagger is hand-maintained or generated; if generated, update the generator config, not just the file (coordinate with [14](../14-api-contract-typed-client/README.md)).
2. Add tests (Jest, per [04](../04-testing-quality-gates/README.md)) around the `/private` middleware / `getCredentials` + role check:
   - anonymous → 401
   - valid `USER` token → 403
   - valid `ADMIN` token → passes
   - `OPTIONS` preflight → not rejected
3. Add at least one integration-style test against a representative admin route (e.g. `POST /private/products`) asserting the same three outcomes, to prove the middleware actually wraps the route and not just the helper in isolation.
4. Ensure these tests run in CI (they will, once [04 step-03](../04-testing-quality-gates/step-03-extend-main-ci-gate.md) extends the gates).

## Dependencies
**Depends on:** [step-02](./step-02-private-middleware-rbac.md) (the behavior under test) and [04 — Testing & Quality Gates](../04-testing-quality-gates/README.md) `step-01` (Jest must be runnable).
**Blocks:** None.

## Implementation notes
- Prefer testing the role-check logic as a unit (fast, no Worker runtime) **and** one route-level test. Full Pages Functions middleware execution may need `wrangler`'s test harness or a thin wrapper that invokes the middleware function directly with a synthetic context — the latter is simpler and enough here.
- Mint test tokens with the real `signJwt`/`getLoggedInToken` (role-carrying, from step 1) so the test exercises the true decode path, including the AES-GCM decrypt wrapper.
- If swagger is generated from Zod, verify the regenerated file still diffs cleanly and that feature 14's spec-freshness CI check will pass.

## Acceptance criteria
- [ ] `swagger.yaml` describes the actual admin auth scheme; no misleading `X-Admin-Secret-Key` on admin-interactive routes.
- [ ] Tests cover anonymous→401, USER→403, ADMIN→pass, and preflight-not-rejected, and are green in CI.
- [ ] At least one test hits a real `/private/*` route end-to-end through the middleware.
- [ ] `npm test` passes locally and in the PR-to-preview workflow.

## References
- `swagger.yaml` — `securitySchemes` (≈ line 3781), `/private/*` path definitions.
- `package.json` — `@asteasolutions/zod-to-openapi` dev dependency (check whether swagger is generated).
- `functions/private/_middleware.ts` — the code under test (created in step 2).
- [04 — Testing & Quality Gates](../04-testing-quality-gates/README.md) — the Jest setup this depends on.

## Verification (2026-07-03 · commit `SPIRIT-101` / `6bf78c7`)
- **Swagger:** confirmed hand-maintained (`@asteasolutions/zod-to-openapi` installed but imported nowhere). Replaced the placeholder `AdminSecretKey` (`apiKey`/`X-Admin-Secret-Key`) with `AdminBearer` (`type: http, scheme: bearer, bearerFormat: JWT`); description documents the required `role: ADMIN` claim, the mandatory `s_r` refresh cookie, and that maintenance routes use a body `secretKey` instead. Renamed all 19 references; YAML validated with js-yaml (`YAML OK`).
- **Tests** (`test/unit/private-middleware.test.ts`): invoke `requireAdmin` with synthetic contexts + real minted tokens (`getLoggedInToken`, exercising the true verify/decrypt/decode path): anonymous → 401, USER → 403, ADMIN → passes to `next()`, OPTIONS → not rejected, `stock/setup` + `expired/*` → bypass RBAC. 6/6 pass (19 total repo-wide).
- **End-to-end through the middleware** was verified in step-02 via wrangler dev (real `GET /private/products`: anonymous 401 / USER 403 / ADMIN 200), satisfying the integration criterion; the plan's note explicitly allows the thin-wrapper unit approach for the automated tests.
- Deferred to feature 14: the swagger has a *global* `security: AdminBearer` default that also applies to public paths (pre-existing, inaccurate but harmless for docs/client-gen). Per-path security accuracy is owned by feature 14's spec-completeness audit.
- `npm run lint` (0 warnings) / `type-check` / `jest` (19) all exit 0.
