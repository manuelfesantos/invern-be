---
status: Done
priority: P0
feature: 16-backoffice-auth-shell
track: backoffice-app
depends_on: ["16-backoffice-auth-shell/step-01"]
blocks: ["16-backoffice-auth-shell/step-03"]
---
# Step 02: Protected routing, token refresh & logout

**Status:** Done · **Priority:** P0 · **Feature:** [Auth & Application Shell](./README.md)

## Technical goal
Gate all app routes behind authentication + `ADMIN`, implement silent access-token refresh (recovering session on reload and on expiry), and a logout that clears client state and revokes the server session.

## User impact
Admin staff stay logged in seamlessly within a session, are redirected to login when their session truly ends, and can log out securely.

## Current state
- Auth state + login exist from [step-01](./step-01-login-flow.md).
- Backend access tokens expire in 15 min (`TOKEN_EXPIRY`); the refresh flow mints a new access token from a valid refresh token (`getCredentials` `handleLoggedInRefreshToken`), and after [02](../02-credential-session-hardening/README.md) the refresh token expires and logout revokes it.
- The data layer has a 401 hook point ([15 step-04](../15-backoffice-scaffolding/step-04-api-client-integration.md)).

## Technical steps
1. Protected route wrapper: a React Router guard that redirects unauthenticated users to `/login` and renders children only when `isAuthenticated && role === ADMIN`. Apply to the whole authenticated area.
2. Silent refresh on load: on app start (or when the in-memory access token is absent after a reload), attempt a refresh using the httpOnly refresh cookie (call the backend in a way that triggers the refresh path — the backend issues a fresh access token when the access token is missing/expired but the refresh token is valid). Populate auth state on success; redirect to login on failure.
3. Refresh on expiry: when a `/private/*` call returns 401 (access token expired), attempt one refresh and retry the request; if refresh fails, clear auth and redirect to login. Centralize this in the data layer's 401 handler so screens don't each handle it. Guard against refresh loops (a single retry).
4. Logout: call the backend logout endpoint (`/public/countries/{code}/user/logout`) which, after [02 step-02](../02-credential-session-hardening/step-02-refresh-token-expiry-revocation.md), revokes the server-side refresh secret; clear in-memory auth state and query cache; redirect to login.
5. Handle the "logged in as non-admin" edge: if a session somehow resolves to a non-admin (role changed server-side mid-session), the next `/private/*` call returns 403 → treat as loss of access (log out / show not-authorized).
6. Persist minimal UX niceties (e.g. remember the intended route to return to after login) without persisting the token insecurely.

## Dependencies
**Depends on:** [step-01](./step-01-login-flow.md). Relies on [02 step-02](../02-credential-session-hardening/step-02-refresh-token-expiry-revocation.md) for real logout revocation and refresh expiry.
**Blocks:** [step-03](./step-03-app-shell-nav-layout.md).

## Implementation notes
- **Single-retry refresh, no loops.** A 401 → refresh → retry once; if the retry also 401s, stop and log out. An unbounded refresh loop on a persistently-invalid session is a classic bug.
- The reload-recovery path is what makes in-memory token storage viable — without it, every refresh logs the user out. Make sure it runs before the first protected render (a brief "restoring session" state is fine).
- Role changes take effect at the next access-token issuance (≤15 min or on refresh) per [01 step-01](../01-admin-auth-rbac-cors/step-01-add-role-claim-to-jwt.md); the 403-handling in step 5 covers the interim.
- Logout must clear the TanStack Query cache too, or a subsequent different login could briefly show the previous user's cached data.

## Acceptance criteria
- [ ] All authenticated routes are gated; unauthenticated/non-admin users are redirected/blocked.
- [ ] A page reload restores the session via silent refresh (no spurious logout).
- [ ] A 401 on a `/private/*` call triggers a single refresh-and-retry; persistent failure logs out cleanly.
- [ ] Logout revokes the server session and clears client state + query cache.
- [ ] A mid-session loss of admin role (403) is handled gracefully.

## References
- `libs/utils/jwt/credentials/get-credentials.ts` — refresh-token path behavior.
- `apps/backend/src/routes/public/user.ts`, `libs/modules/user/use-cases/logout.ts` — logout endpoint.
- [02 step-02](../02-credential-session-hardening/step-02-refresh-token-expiry-revocation.md) — server-side revocation the logout depends on.
- [15 step-04](../15-backoffice-scaffolding/step-04-api-client-integration.md) — the 401 handler this centralizes.
