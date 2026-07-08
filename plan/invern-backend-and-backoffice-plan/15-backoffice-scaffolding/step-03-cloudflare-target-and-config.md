---
status: Not Started
priority: P0
feature: 15-backoffice-scaffolding
track: backoffice-app
depends_on: ["15-backoffice-scaffolding/step-01"]
blocks: ["24-backoffice-deployment/step-01"]
---
# Step 03: Cloudflare target & environment-driven config

**Status:** Not Started · **Priority:** P0 · **Feature:** [Backoffice Scaffolding, Tooling & Cloudflare Target](./README.md)

## Technical goal
Choose and configure the Cloudflare hosting model for the built SPA (Workers static assets, per this plan's decision), and make all environment-specific configuration — especially the backend (`apps/backend`) API base URL — env-driven for local/preview/production.

## User impact
None directly; determines how/where the backoffice deploys and ensures it talks to the right backend per environment.

## Current state
- Greenfield; no backoffice deployment config exists.
- The backend (`apps/backend`) is a Cloudflare **Worker** deployed from the monorepo tied to `main`/`preview`, with production API at `https://api.invernspirit.com` (see `swagger.yaml` servers). The backoffice's deploy will be a sibling per-app workflow in the same shared `.github/workflows/` ([24](../24-backoffice-deployment/README.md)).
- The backend's CORS ([01 step-03](../01-admin-auth-rbac-cors/step-03-cors-policy-two-origins.md)) needs the backoffice's origin(s) — so the backoffice's hostnames must be decided here and fed back to the backend.

## Technical steps
1. Confirm the hosting model (open question 2). This plan chooses **Cloudflare Workers static assets** — the current recommended path to serve a built SPA from a Worker (a `wrangler.toml`/`wrangler.jsonc` with an assets binding serving `dist/`, plus SPA fallback routing). Verify the exact current config against live Cloudflare docs at implementation time (the Workers-assets story has evolved). Record why over Pages: keeps the whole app in the Workers model, single deploy primitive, consistent with how `apps/backend` already deploys; Pages remains the documented fallback if preferred.
2. Configure `wrangler` for the SPA: serve the Vite `dist/` output as static assets, with SPA fallback (unknown routes → `index.html`) so React Router client routing works.
3. Environment config: expose the API base URL (and any other env-specific values) via Vite env vars (`import.meta.env.VITE_API_BASE_URL`), with `.env.local`/`.env.preview`/`.env.production` (or Vite mode files). **No hardcoded URLs.** Map: local → local wrangler backend, preview → backend preview, production → `https://api.invernspirit.com`.
4. Decide the backoffice's own hostnames per environment (e.g. `admin.invernspirit.com` for prod, a stable preview host) and record them so [01 step-03](../01-admin-auth-rbac-cors/step-03-cors-policy-two-origins.md) can add them to the backend CORS allow-list. This is the concrete cross-repo handshake.
5. Ensure no secrets live in the frontend bundle: the backoffice is a public SPA, so anything shipped is public. The only "config" is public URLs; real secrets never belong here (auth is via the user's JWT at runtime, not a build secret).
6. Document local dev: how to run the backoffice against a local backend (`apps/backend` via `npm start` / `wrangler dev`, in the same monorepo) including the CORS/cookie implications (the backend's local CORS is `https://localhost:8081` today — align the backoffice dev origin/port or extend the backend allow-list). Turbo can run both apps together.

## Dependencies
**Depends on:** [step-01](./step-01-repo-vite-react-ts-tailwind.md). Feeds [01 step-03](../01-admin-auth-rbac-cors/step-03-cors-policy-two-origins.md) (origins) and [24](../24-backoffice-deployment/README.md) (deploy).
**Blocks:** [24 step-01](../24-backoffice-deployment/step-01-cloudflare-project-preview-prod.md).

## Implementation notes
- **Verify the Workers-static-assets config against current docs.** This is the one area where "how Cloudflare recommends hosting an SPA" has changed repeatedly; don't hardcode a stale pattern. If the current tooling makes Pages materially simpler, that's a legitimate reason to switch — record the decision.
- **No secrets in the SPA.** A frontend bundle is fully public. Auth uses the runtime JWT (feature 16); there is nothing secret to configure at build time beyond public URLs.
- The local dev CORS/cookie story matters: the refresh-token cookie is `SameSite`/`Secure`/domain-scoped (the backend's `getTokenCookie` in `apps/backend`/`libs`), which interacts with cross-origin local dev. Sort the local origin/port + backend allow-list now so feature 16's login works locally.
- Align the backoffice dev port with whatever the backend's local CORS expects, or plan to extend that allow-list in [01 step-03](../01-admin-auth-rbac-cors/step-03-cors-policy-two-origins.md).

## Acceptance criteria
- [ ] The hosting model (Workers static assets) is configured with SPA fallback; a built bundle deploys/serves locally via `wrangler`.
- [ ] API base URL and env-specific config are env-driven (no hardcoded URLs); local/preview/prod mappings documented.
- [ ] The backoffice's per-environment hostnames are decided and handed to the backend CORS work.
- [ ] No secrets are present in the frontend build.
- [ ] Running the backoffice against a local backend (`apps/backend`) is documented, including CORS/cookie handling.

## References
- The monorepo's shared `.github/workflows/*` and `apps/backend/wrangler.jsonc` — the deploy/branch model to add a sibling backoffice workflow to.
- `swagger.yaml` servers — prod/preview backend URLs.
- [01 step-03](../01-admin-auth-rbac-cors/step-03-cors-policy-two-origins.md) — backend CORS that needs these origins.
- `apps/backend` / `libs/utils/jwt/jwt-utils.ts` `getTokenCookie` — cookie scoping relevant to cross-origin dev.
- [24](../24-backoffice-deployment/README.md) — production deployment building on this.
