---
status: Done
priority: P0
feature: 01-admin-auth-rbac-cors
track: backend-hardening
depends_on: ["01-admin-auth-rbac-cors/step-01"]
blocks: ["01-admin-auth-rbac-cors/step-04", "16-backoffice-auth-shell/step-01"]
---
# Step 02: `/private` authentication + RBAC middleware

**Status:** Done · **Priority:** P0 · **Feature:** [Admin Authentication, RBAC & CORS](./README.md)

## Technical goal
Introduce `functions/private/_middleware.ts` that authenticates the caller and requires `role === "ADMIN"` before any `/private/*` handler runs, so authorization lives in exactly one place. Reconcile the two existing shared-secret maintenance routes and the machine-driven `/private/expired/*` routes with the new model.

## User impact
Admin/backoffice staff: only authenticated admins can reach admin endpoints. Shoppers: unaffected. On-call: closes the unauthenticated-write hole.

## Current state
- There is **no** `functions/private/_middleware.ts` (verified: `find functions/private -name "_middleware.ts"` → none). Pages Functions file-based routing means a `_middleware.ts` at `functions/private/` wraps every route beneath it.
- Route handlers under `functions/private/**` call use-cases directly with zero auth (e.g. `functions/private/products/index.ts`).
- `/private/insert-test-data` and `/private/stock/setup` self-check a `secretKey` body field against `ENV.INSERT_TEST_DATA_SECRET` / `ENV.SETUP_STOCK_SECRET`.
- `/private/expired/{carts,sessions,users}` take no auth and are almost certainly invoked by a scheduler/cron, not a browser.
- The global `functions/_middleware.ts` runs first (logger + env + Honeycomb) and already establishes the `contextStore`; the new `/private` middleware nests inside it.

## Technical steps
1. Classify every current `/private/*` route into two buckets and record the classification in this step's PR description:
   - **Admin-interactive** (backoffice calls these): `currencies`, `countries`, `products`, `collections`, `carts`, `users`, `orders`, `stock/[productId]` — plus everything Track B adds (shipping, images, taxes, dashboard).
   - **Machine/maintenance** (no human admin): `expired/carts`, `expired/sessions`, `expired/users`, `insert-test-data`, `stock/setup`.
2. Create `functions/private/_middleware.ts` that, for **admin-interactive** routes, resolves credentials via the existing `getCredentials(headers)` path (reused from the public middleware), then requires `role === "ADMIN"`; return `401` when unauthenticated, `403` when authenticated but not admin. Use the shared error responses (`errorResponse.UNAUTHORIZED()` / `errorResponse.FORBIDDEN()`).
3. Decide the machine-route strategy (pick one, note why in the PR):
   - **(a) Keep secret-gating** for `insert-test-data`/`stock/setup` and add the same body-secret or a header-secret to `expired/*`, and have the middleware **skip** admin auth for this sub-set. Simplest; keeps cron working.
   - **(b) Move maintenance routes** under a different prefix (e.g. `/private/maintenance/*`) so the RBAC middleware cleanly covers only admin-interactive routes. Cleaner but touches routing.
   - Recommended: **(a)** for now (smaller diff, no cron reconfiguration), with a note to revisit under feature 6.
4. Ensure the middleware does not break the one route that already emits its own CORS header (`stock/[productId]`); CORS is centralized in [step-03](./step-03-cors-policy-two-origins.md), so coordinate the two changes.
5. Confirm `OPTIONS` preflight requests are answered **before** the auth check (a 401 on preflight breaks browser CORS). The global middleware already special-cases `OPTIONS`/`HEAD`; make sure the `/private` middleware doesn't shadow that.
6. Verify the JWT/credential resolution works with how the backoffice will send tokens (Authorization header vs cookie). `getTokensFromHeaders` currently reads both; confirm and document which the backoffice should use (feature 16 will follow this).

## Dependencies
**Depends on:** [step-01](./step-01-add-role-claim-to-jwt.md) (needs `role` on credentials).
**Blocks:** [step-04](./step-04-admin-auth-tests-and-swagger.md); [16 — Auth & Application Shell](../16-backoffice-auth-shell/README.md); the safety of all Track B endpoints.

## Implementation notes
- **Enumerate callers before enabling.** The biggest risk is silently 401ing a cron job. Grep the repo and any infra config for callers of `/private/expired/*` and the setup routes; if a Cloudflare Cron trigger hits them, its request won't carry an admin JWT. This is why step 3 keeps a machine-auth path.
- **Reuse, don't reinvent, credential resolution.** `getCredentials` already handles access-token verification, refresh-token fallback, and anonymous cases. The middleware should call it and then branch on `role`, rather than re-implementing token parsing.
- **Fail closed.** If credential resolution throws, return 401 — never fall through to the handler. The `requestHandler`/`middlewareRequestHandler` wrappers convert thrown `errors.*` into proper responses; lean on that.
- **Order of middleware matters.** Global `functions/_middleware.ts` (`onRequest = [startLogger, setGlobalEnvs]`) runs first and sets up logging + `contextStore`; the `/private` middleware runs after, so `logger()`/`ENV` are available.
- Rollback: the middleware is one file; deleting it reverts to the (insecure) prior behavior instantly if it misbehaves in preview. Validate thoroughly in `preview` before promoting.

## Acceptance criteria
- [ ] `functions/private/_middleware.ts` exists and wraps all `/private/*` routes.
- [ ] Anonymous request to an admin-interactive `/private/*` route → `401`; authenticated `USER`-role request → `403`; `ADMIN` request → passes through.
- [ ] `/private/expired/*`, `/private/insert-test-data`, `/private/stock/setup` continue to work for their existing (machine/secret) callers.
- [ ] `OPTIONS` preflight to any `/private/*` route is not rejected by the auth check.
- [ ] No route handler under `functions/private/**` contains its own duplicate auth check afterward (single source of truth).
- [ ] Tests from [step-04](./step-04-admin-auth-tests-and-swagger.md) pass.

## References
- `functions/_middleware.ts` — global middleware pattern (`onRequest` array, `middlewareRequestHandler`).
- `functions/public/countries/[countryCode]/_middleware.ts` — existing example of a nested middleware that calls `getCredentials` and populates context.
- `libs/utils/jwt/credentials/get-credentials.ts` — `getCredentials`.
- `libs/entities/response/error-response.ts` — `errorResponse.UNAUTHORIZED` / `FORBIDDEN`.
- `functions/private/expired/*`, `functions/private/insert-test-data/index.ts`, `functions/private/stock/setup/index.ts` — machine/maintenance routes to reconcile.

## Verification (2026-07-03 · commit `SPIRIT-101` / `641c1df`)
- Added `functions/private/_middleware.ts` (`requireAdmin`): parses the sub-path after `/private/`, bypasses RBAC for a `SELF_GATED_PREFIXES` allowlist, else calls `getCredentials(request.headers)` and requires `role === RolesEnum.ADMIN` (else 403). `getCredentials` throws UNAUTHORIZED → 401 for anonymous. OPTIONS/HEAD short-circuit to `next()` (defensive; global middleware answers preflight in local).
- **Machine-route decision (strategy a):** allowlisted `insert-test-data`, `stock/setup` (self-gate via body `secretKey`) and `expired/` to bypass RBAC. Confirmed there is **no** cron trigger (`wrangler.toml`), **no** `scheduled()` handler, and **no** HTTP/internal caller of `/private/expired/*` in the repo — so nothing breaks. `expired/*` remains unauthenticated (pre-existing, low blast radius: deletes only already-expired rows); adding a service-token/scheduler auth is deferred to feature 06's runbook step (already scoped there).
- **Robustness note (from step-01):** the middleware trusts the token's `role` claim, which login + the refresh-mint path both populate correctly (the paths the backoffice uses). A DB role-lookup fallback was considered but skipped: the backoffice never holds a role-less admin token, and `functions/` cannot import `@*-db` directly (eslint layer rule) so a fallback would need a new `getUserRole` use-case — deferred unless a role-less admin token is ever observed at `/private`.
- **End-to-end (wrangler pages dev, local D1, seeded ADMIN+USER, both tokens = Authorization bearer + `s_r` refresh cookie, which `getCredentials` requires together):**
  - `GET /private/products`: anonymous **401**, USER **403**, ADMIN **200** (returned catalog data).
  - `GET /private/{users,currencies,countries,collections,orders,carts}`: anonymous **401** (all gated).
  - `POST /private/stock/setup`: correct secret **200**, wrong secret **401**; `DELETE /private/expired/sessions` **200** (bypass preserved); `OPTIONS /private/products` **200** (preflight not rejected).
- `npm run lint` (0 warnings) / `type-check` / `jest` (13 tests) all exit 0.
- **Discovered issue (flagged, not fixed here — systemic, out of step-02 scope):** error responses (`generateErrorResponse` → `simplifyError`) include a `stack` field, so 401/403/500 bodies leak server file paths. Recommend stripping `stack` from client-facing error bodies (keep it in logs) — a hardening item for feature 06. Recorded in this plan's summary.
- Automated middleware tests are owned by **step-04** (swagger + rejection tests), done next.
