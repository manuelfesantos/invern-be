---
status: Not Started
priority: P1
feature: 24-backoffice-deployment
track: backoffice-app
depends_on: ["24-backoffice-deployment/step-01", "01-admin-auth-rbac-cors/step-03"]
blocks: ["24-backoffice-deployment/step-03"]
---
# Step 02: Custom domain & environment secrets

**Status:** Not Started · **Priority:** P1 · **Feature:** [Backoffice Deployment & Environments](./README.md)

## Technical goal
Put the backoffice on a custom admin domain (e.g. `admin.invernspirit.com`), ensure the backend CORS allow-lists it, and manage environment config correctly — public config only, no secrets in the bundle — so cross-origin authenticated requests work in production.

## User impact
Admin staff reach the backoffice at a stable, branded, secure URL and can log in against the production API.

## Current state
- The Cloudflare project + environments exist ([step-01](./step-01-cloudflare-project-preview-prod.md)).
- The backend CORS ([01 step-03](../01-admin-auth-rbac-cors/step-03-cors-policy-two-origins.md)) is env-driven and needs the backoffice's production/preview origins; the refresh-token cookie is domain/SameSite-scoped ([16 step-01](../16-backoffice-auth-shell/step-01-login-flow.md)).
- Backend prod API is `https://api.invernspirit.com`.

## Technical steps
1. Attach a custom domain per environment (e.g. `admin.invernspirit.com` for production, a stable preview host) to the Cloudflare project, with TLS.
2. Feed those origins to the backend CORS allow-list ([01 step-03](../01-admin-auth-rbac-cors/step-03-cors-policy-two-origins.md)) — this is the cross-repo handshake. Verify preflight + credentialed requests succeed from the admin origin.
3. Cookie/cross-origin auth: if using the httpOnly refresh cookie ([16 step-01](../16-backoffice-auth-shell/step-01-login-flow.md)), confirm it is sent from `admin.invernspirit.com` to `api.invernspirit.com` — this typically requires a shared parent domain (`invernspirit.com`) and correct `Domain`/`SameSite` on the cookie (backend `getTokenCookie` uses `Domain=ENV.DOMAIN`, `SameSite=Strict` in prod — `SameSite=Strict` may block cross-subdomain sending in some flows; verify and, if needed, coordinate a backend change to `SameSite=Lax`/`None; Secure` for the admin flow). Flag any backend cookie adjustment to [02](../02-credential-session-hardening/README.md)/[01](../01-admin-auth-rbac-cors/README.md).
4. Environment config: set the production/preview API base URLs as Cloudflare env vars ([15 step-03](../15-backoffice-scaffolding/step-03-cloudflare-target-and-config.md)); confirm **no secrets** are in the SPA build (it's public).
5. Consider Cloudflare Access in front of the admin domain (open question 6) as defense-in-depth — document the decision (adds an org-level gate before the app's own RBAC).
6. Verify production login end-to-end from the custom domain.

## Dependencies
**Depends on:** [step-01](./step-01-cloudflare-project-preview-prod.md), [01 step-03](../01-admin-auth-rbac-cors/step-03-cors-policy-two-origins.md).
**Blocks:** [step-03](./step-03-e2e-smoke-and-release-runbook.md).

## Implementation notes
- **The cross-subdomain cookie is the classic production-only failure.** Local dev often works while prod breaks because of `SameSite`/`Domain` cookie scoping between `admin.` and `api.` subdomains. Test the real cross-subdomain flow early; it may require a backend cookie-attribute change (coordinate — don't just widen it blindly, since `SameSite` is a CSRF control).
- **No secrets in the SPA.** Reiterate: the bundle is public. Auth is the runtime JWT; the only config is public URLs.
- Cloudflare Access (open question 6) is a strong option for an internal tool — an extra identity gate before the app loads. Note the tradeoff (another login layer) and let the user decide.

## Acceptance criteria
- [ ] The backoffice is served on a custom admin domain (prod + a stable preview host) with TLS.
- [ ] The backend CORS allow-lists the admin origin(s); credentialed preflight/requests succeed.
- [ ] Cross-subdomain auth (JWT + refresh cookie) works in production; any needed backend cookie change is coordinated.
- [ ] Env config is set per environment; the SPA build contains no secrets.
- [ ] The Cloudflare Access decision (open question 6) is documented.

## References
- [01 step-03](../01-admin-auth-rbac-cors/step-03-cors-policy-two-origins.md) — backend CORS allow-list.
- [16 step-01](../16-backoffice-auth-shell/step-01-login-flow.md) — cross-origin cookie flow.
- `libs/utils/jwt/jwt-utils.ts` `getTokenCookie` — cookie scoping to verify/adjust.
- [15 step-03](../15-backoffice-scaffolding/step-03-cloudflare-target-and-config.md) — env config.
