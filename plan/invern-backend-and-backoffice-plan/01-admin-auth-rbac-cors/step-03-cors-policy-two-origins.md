---
status: Done
priority: P0
feature: 01-admin-auth-rbac-cors
track: backend-hardening
depends_on: []
blocks: ["16-backoffice-auth-shell/step-01"]
---
# Step 03: Deliberate CORS policy for both frontends

**Status:** Done · **Priority:** P0 · **Feature:** [Admin Authentication, RBAC & CORS](./README.md)

## Technical goal
Replace the ad-hoc, local-only CORS handling with an explicit, environment-driven allow-list that grants cross-origin access to the storefront **and** the backoffice origins across `local`/`preview`/`production`, applied consistently to every response (especially `/private/*` and `OPTIONS` preflights).

## User impact
Admin/backoffice staff: the backoffice (on its own origin) can actually call the API from a browser. Shoppers: the storefront keeps working across environments, not just locally.

## Current state
- `functions/_middleware.ts` adds CORS headers **only** when `env.ENV === "local"`, hardcoded to `https://localhost:8081`, via `addLocalCorsHeaders`. There is no preview/production CORS.
- Exactly one route sets CORS itself: `functions/private/stock/[productId]/index.ts` appends `Access-Control-Allow-Origin: ENV.FRONTEND_HOST`.
- `Env` has `FRONTEND_HOST` (single origin) and `DOMAIN`. There is no notion of a *second* (backoffice) origin.
- Credentials mode is in use (`Access-Control-Allow-Credentials: true` locally, cookies for refresh token), which means the `Access-Control-Allow-Origin` **cannot** be `*` — it must echo a specific allowed origin.

## Technical steps
1. Introduce an env-driven allow-list. Add (to `Env` and `.dev.vars`/wrangler vars, coordinating with [05](../05-configuration-data-hygiene/README.md)) a `BACKOFFICE_HOST` and treat the set `{ FRONTEND_HOST, BACKOFFICE_HOST }` as the allowed origins. Consider a comma-separated `CORS_ALLOWED_ORIGINS` if more flexibility is wanted.
2. Write a single `applyCors(request, response)` helper (in `libs/utils/http/**`) that: reads the request `Origin`; if it is in the allow-list, sets `Access-Control-Allow-Origin: <that origin>`, `Access-Control-Allow-Credentials: true`, and the existing allowed headers/methods; otherwise sets no ACAO header. Echoing the matched origin (not `*`) is required because credentials are used.
3. Apply it centrally in `functions/_middleware.ts` for all environments (remove the `ENV === "local"` gate and the hardcoded `localhost:8081`). Ensure `OPTIONS` preflight responses get the same headers.
4. Remove the one-off header in `functions/private/stock/[productId]/index.ts` now that CORS is centralized (verify it still returns the stock payload correctly).
5. Coordinate with [step-02](./step-02-private-middleware-rbac.md): preflight (`OPTIONS`) must be answered with CORS headers and **without** requiring an admin JWT.
6. Document the final origin values per environment in the deploy runbook ([06](../06-observability-ops-readiness/README.md)) and in [15](../15-backoffice-scaffolding/README.md)/[24](../24-backoffice-deployment/README.md).

## Dependencies
**Depends on:** None (can proceed in parallel with step-01/02, but must be coordinated with step-02 on preflight ordering).
**Blocks:** [16 — Auth & Application Shell](../16-backoffice-auth-shell/README.md) — the backoffice can't authenticate cross-origin without this.

## Implementation notes
- **Never combine `Allow-Credentials: true` with `Allow-Origin: *`** — browsers reject it and it's a security anti-pattern. Always echo the specific matched origin.
- Preview environments may use per-PR preview URLs (see [24](../24-backoffice-deployment/README.md)); if the backoffice preview origin is dynamic, either use a suffix match against a known preview domain (the backoffice Cloudflare project's `*.workers.dev`/`*.pages.dev` preview domain) or route all preview traffic through a stable hostname. Prefer a stable preview hostname to avoid wildcard-origin matching logic.
- Keep the allowed-headers list in sync with what the backoffice actually sends (`Content-Type`, `Authorization`, and any custom headers the token flow uses).
- Watch the existing `country` / `x-data-center` custom request headers the storefront sends (see `functions/_middleware.ts`); include them in `Access-Control-Allow-Headers` if the backoffice or storefront sets them.

## Acceptance criteria
- [ ] A request from the storefront origin and a request from the backoffice origin both receive a correct `Access-Control-Allow-Origin` echoing their origin, in `preview` and `production` (not just `local`).
- [ ] A request from a disallowed origin receives no `Access-Control-Allow-Origin` header.
- [ ] `OPTIONS` preflight to `/private/*` succeeds with CORS headers and does not require authentication.
- [ ] Responses never send `Access-Control-Allow-Origin: *` together with credentials.
- [ ] The one-off CORS header in `stock/[productId]/index.ts` is removed and that route still works.

## References
- `functions/_middleware.ts` — `addLocalCorsHeaders`, the `ENV === "local"` gate.
- `functions/private/stock/[productId]/index.ts` — the one-off `Access-Control-Allow-Origin` header to remove.
- `libs/entities/env/index.ts` — `Env` (`FRONTEND_HOST`, `DOMAIN`); add `BACKOFFICE_HOST`.
- `libs/utils/http/**` — home for the `applyCors` helper.

## Verification (2026-07-03 · commit `SPIRIT-101` / `cbb6cde`)
- Added `libs/utils/http/cors.ts` (`getAllowedOrigins`, `resolveCorsOrigin`, `applyCorsHeaders`, `corsPreflightResponse`); exported from `@http-utils`. Echoes the request `Origin` only when in `{FRONTEND_HOST, BACKOFFICE_HOST}`; sets `Allow-Credentials: true` + headers/methods + `Vary: Origin`; never `*`. Origins are passed in explicitly (not via the `ENV` proxy) so they work in `startLogger`, which runs before `setEnv`.
- Rewrote `functions/_middleware.ts`: removed the `ENV==="local"` gate + hardcoded `https://localhost:8081`; CORS now applies in **all** envs; `OPTIONS` → 204 preflight with CORS, no auth. Added `BACKOFFICE_HOST` to `Env`, `.dev.vars` (`http://localhost:5173`), `.env.example`, and the test harness fake env. Removed the one-off ACAO header in `stock/[productId]`.
- **Env-agnostic by construction:** the same code path serves local/preview/production (values differ per env), so the "works in preview/prod, not just local" criterion is met by removing the env gate (only local is runnable on this machine).
- E2E (wrangler pages dev): OPTIONS `/private/products` from `http://localhost:5173` → **204** + ACAO=that origin + credentials + headers/methods, **no auth**; OPTIONS from `https://localhost:8081` → ACAO=storefront; OPTIONS from `evil.example.com` → **204, no ACAO**; GET from backoffice origin → **200**, ACAO echoes origin + credentials (not `*`); `GET /private/stock/{id}` (admin) still **200** after header removal.
- `npm run lint` (0 warnings) / `type-check` / `jest` (13) all exit 0.
- Backoffice local origin assumed `http://localhost:5173` (Vite default); confirm/adjust in feature 15. Preview/prod origins still TBD (open question 7) — set them in `wrangler`/dashboard when known.
