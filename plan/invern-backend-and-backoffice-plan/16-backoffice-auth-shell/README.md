# 16 — Auth & Application Shell

**Status:** Not Started · **Priority:** P0 · **Track:** Backoffice App

## Summary
Build the backoffice's authentication and the shell that hosts every screen: an admin login against the backend's existing JWT flow, gated on the user's `role` actually being `ADMIN` (enforced server-side by feature [01](../01-admin-auth-rbac-cors/README.md)); protected routing with token-refresh handling and logout; and the nav/layout chrome (sidebar, header, page container) that entity screens render into.

## Why this matters
This is the gate between "an internal admin tool" and "a public URL anyone can poke." It depends on the backend actually enforcing `ADMIN` — without feature [01](../01-admin-auth-rbac-cors/README.md), a backoffice "login" would be theater, since the API would serve anyone regardless. The shell is the frame that makes the whole app feel like one product rather than a pile of screens.

## Goals — what "done" looks like
- An admin can log in with email/password; non-admins (`role !== ADMIN`) are rejected with a clear message, and unauthenticated users can't reach any protected route.
- Access-token handling + refresh works (silent refresh on expiry; graceful redirect-to-login on hard 401), and logout revokes the session server-side ([02](../02-credential-session-hardening/README.md)).
- The app shell (nav, header, layout, active-route highlighting) is in place and responsive.
- Auth state is the single source of truth the data layer's auth-injection hook ([15 step-04](../15-backoffice-scaffolding/step-04-api-client-integration.md)) reads from.

## User / business impact
Admin staff: secure sign-in and a coherent app frame. Shoppers: none. Security: the front door — must be correct.

## In scope / Out of scope
**In scope:** login screen + flow; role gating to ADMIN; protected routing; token storage + refresh + logout; the nav/layout shell.
**Out of scope:** the backend RBAC itself ([01](../01-admin-auth-rbac-cors/README.md)); the component primitives the login form uses ([17](../17-backoffice-design-system/README.md) — but login may land alongside a minimal subset); entity screens (18–23); optional Cloudflare Access ([24](../24-backoffice-deployment/README.md)/open question 6).

## Dependencies
**Depends on:** [01](../01-admin-auth-rbac-cors/README.md) (server-side ADMIN enforcement + role in JWT — this is the hard cross-track dependency), [14](../14-api-contract-typed-client/README.md) (typed auth calls), [15](../15-backoffice-scaffolding/README.md) (app + data layer). Benefits from [02](../02-credential-session-hardening/README.md) (logout revocation, refresh expiry) and [17](../17-backoffice-design-system/README.md) (form/toast components).
**Blocks:** every entity screen (18–23) — they render inside the shell and require an authenticated admin.

## Steps
| # | Step | Priority | Status | Depends on |
|---|---|---|---|---|
| 01 | [Admin login flow (JWT + ADMIN gate)](./step-01-login-flow.md) | P0 | Not Started | 01-admin-auth-rbac-cors/step-02, 15-backoffice-scaffolding/step-04 |
| 02 | [Protected routing, token refresh & logout](./step-02-protected-routing-and-refresh.md) | P0 | Not Started | step-01 |
| 03 | [Application shell: nav & layout](./step-03-app-shell-nav-layout.md) | P0 | Not Started | step-02 |

## Key risks
- **Client-side role checks are not security.** Hiding admin UI when `role !== ADMIN` is UX only; the real enforcement is the backend gate ([01](../01-admin-auth-rbac-cors/README.md)). Never rely on the SPA to protect data.
- **Token storage tradeoffs.** Where the access token lives (memory vs localStorage) affects XSS exposure; the refresh token is an httpOnly cookie server-side. Choose deliberately and document.
- **Admin bootstrap gap.** If no user has `role = ADMIN`, login is impossible — the first admin is created out-of-band ([06 step-04](../06-observability-ops-readiness/step-04-ops-runbook.md)). Surface this so it isn't discovered at first login.

## Relevant existing code / references
- `libs/modules/user/use-cases/login.ts` — the login use-case (email/password → tokens + user incl. `role`).
- `apps/backend/src/routes/public/user.ts` — the login/logout endpoints the backoffice calls (note: login is country-scoped under `/public/countries/{code}/user/login`).
- `libs/utils/jwt/jwt-utils.ts` — token issuance, `getTokenCookie` (refresh cookie scoping), `TOKEN_EXPIRY` (15 min access token).
- [01](../01-admin-auth-rbac-cors/README.md) — role claim + `/private` gate this relies on.
- [15 step-04](../15-backoffice-scaffolding/step-04-api-client-integration.md) — the data layer's auth-injection hook + 401 handling this drives.
- [02 step-02](../02-credential-session-hardening/step-02-refresh-token-expiry-revocation.md) — logout revocation the client should trigger.
