---
status: Done
priority: P0
feature: 16-backoffice-auth-shell
track: backoffice-app
depends_on: ["01-admin-auth-rbac-cors/step-02", "15-backoffice-scaffolding/step-04"]
blocks: ["16-backoffice-auth-shell/step-02"]
---
# Step 01: Admin login flow (JWT + ADMIN gate)

**Status:** Done · **Priority:** P0 · **Feature:** [Auth & Application Shell](./README.md)

## Technical goal
Build the login screen and flow that authenticates against the backend's login endpoint, stores the resulting token(s), captures the user (including `role`), and admits only `ADMIN`s — with the backend as the real enforcer.

## User impact
Admin staff sign in with email/password; non-admins are told they lack access rather than landing in a broken app.

## Current state
- Greenfield frontend; the data layer + auth-injection hook exist from [15 step-04](../15-backoffice-scaffolding/step-04-api-client-integration.md).
- Backend login is `POST /public/countries/{countryCode}/user/login` (country-scoped) — `login.ts` returns the user (with `role`), a cart, and a `responseContext` with `accessToken`/`refreshToken`; the access token is in the JSON body and the refresh token is set as an httpOnly cookie (`getTokenCookie`). After [01](../01-admin-auth-rbac-cors/README.md), the access token carries `role`.
- The backend enforces `ADMIN` on `/private/*` ([01 step-02](../01-admin-auth-rbac-cors/step-02-private-middleware-rbac.md)) — so even if the SPA mis-gates, the API refuses non-admins.

## Technical steps
1. Build a login route/screen (email, password, remember-me) using RHF + Zod (mirroring the backend `loginBodySchema`: email, password, remember). Use the design-system form components if [17](../17-backoffice-design-system/README.md) has landed; otherwise a minimal inline form to be refactored onto the DS later.
2. Resolve the country-scoped login path: the endpoint is under `/public/countries/{countryCode}/user/login`. Decide the backoffice's country context (a fixed admin country code, e.g. the store's primary country, or a configured value) since admins log in irrespective of a shopper country — document the choice. (If desired, raise with backend whether a non-country-scoped admin login should exist; for now, use a configured code.)
3. On success: capture `accessToken` from the body and the user object; verify `user.role === "ADMIN"` client-side for UX (show "not authorized" if not) — but rely on the backend gate for real enforcement. Store auth state (see notes on storage).
4. On failure: surface the backend's generic invalid-credentials message (don't leak which field was wrong); handle the rate-limit `429` ([02 step-04](../02-credential-session-hardening/step-04-login-rate-limiting.md)) with a "try again later" message.
5. Feed the token into the data layer's auth-injection hook ([15 step-04](../15-backoffice-scaffolding/step-04-api-client-integration.md)) so subsequent `/private/*` calls are authenticated.
6. Establish the auth context/store (e.g. a small Zustand store or React context) holding `{ user, accessToken, isAuthenticated }` as the single source of truth for [step-02](./step-02-protected-routing-and-refresh.md)/[step-03](./step-03-app-shell-nav-layout.md).

## Dependencies
**Depends on:** [01 step-02](../01-admin-auth-rbac-cors/step-02-private-middleware-rbac.md) (server enforcement + role claim), [15 step-04](../15-backoffice-scaffolding/step-04-api-client-integration.md) (client + injection hook).
**Blocks:** [step-02](./step-02-protected-routing-and-refresh.md).

## Implementation notes
- **Token storage:** prefer keeping the **access token in memory** (JS variable / store) rather than `localStorage` to reduce XSS token theft; the **refresh token** is an httpOnly cookie the browser sends automatically (with `credentials: 'include'`). On a full page reload the in-memory access token is lost — recover it via a silent refresh ([step-02](./step-02-protected-routing-and-refresh.md)) using the cookie. Document this model.
- **Client role check is UX only.** The "you're not an admin" screen is courtesy; the backend `/private` gate is the security boundary. Never assume the SPA protects anything.
- The refresh cookie is domain/SameSite-scoped (`getTokenCookie` uses `SameSite=Strict` outside local, `Domain=ENV.DOMAIN`). Cross-origin backoffice→backend cookie behavior needs the CORS credentials setup from [01 step-03](../01-admin-auth-rbac-cors/step-03-cors-policy-two-origins.md) and possibly a shared parent domain (e.g. `admin.invernspirit.com` + `api.invernspirit.com` under `invernspirit.com`) — verify the cookie is actually sent cross-subdomain, or the refresh flow breaks. Flag this early.
- If no `ADMIN` user exists yet, login can't succeed — link the admin-bootstrap runbook ([06 step-04](../06-observability-ops-readiness/step-04-ops-runbook.md)) in the repo README so first-run isn't a mystery.

## Acceptance criteria
- [ ] An `ADMIN` user can log in and reach the app; a valid non-admin is shown a clear "not authorized" state and cannot proceed.
- [ ] Invalid credentials show a generic error; `429` is handled gracefully.
- [ ] The access token is stored per the documented model (memory) and injected into `/private/*` calls.
- [ ] Auth state (`user`, `role`, `isAuthenticated`) is a single source of truth for routing/shell.
- [ ] The cross-subdomain refresh-cookie behavior is verified (or the blocker is flagged with the fix).

## References
- `libs/modules/user/use-cases/login.ts` — `loginBodySchema`, return shape (user+role, tokens).
- `apps/backend/src/routes/public/user.ts` — the endpoint (country-scoped).
- `libs/utils/jwt/jwt-utils.ts` — `getTokenCookie` scoping, `TOKEN_EXPIRY`.
- [15 step-04](../15-backoffice-scaffolding/step-04-api-client-integration.md) — auth-injection hook.
- [01 step-03](../01-admin-auth-rbac-cors/step-03-cors-policy-two-origins.md) — CORS credentials for cross-origin auth.
