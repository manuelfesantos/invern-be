---
status: Not Started
priority: P1
feature: 24-backoffice-deployment
track: backoffice-app
depends_on: ["15-backoffice-scaffolding/step-03"]
blocks: ["24-backoffice-deployment/step-02"]
---
# Step 01: Cloudflare project: preview & production

**Status:** Not Started · **Priority:** P1 · **Feature:** [Backoffice Deployment & Environments](./README.md)

## Technical goal
Create the Cloudflare project that deploys the built backoffice SPA (Workers static assets) with `preview` and `production` environments tied to the `preview`/`main` branches, and a preview deployment per PR if the tooling supports it out of the box.

## User impact
None directly; makes the backoffice deployable and gives each PR a preview URL for review.

## Current state
- The hosting model + `wrangler` config are set in [15 step-03](../15-backoffice-scaffolding/step-03-cloudflare-target-and-config.md) (Workers static assets, SPA fallback, env-driven config).
- The backend (`apps/backend`) deploys via Cloudflare tied to `main`/`preview`; the backoffice mirrors that branch model (a sibling per-app workflow in the shared pipeline).

## Technical steps
1. Create the Cloudflare project/Worker for the backoffice, wired to the repo, deploying `dist/` as static assets with SPA fallback.
2. Configure environments: `production` (deploys from `main`) and `preview` (deploys from `preview`), each with its own env vars (API base URL per [15 step-03](../15-backoffice-scaffolding/step-03-cloudflare-target-and-config.md)).
3. Preview-per-PR: enable Cloudflare's PR/branch preview deployments if supported for the Workers-assets setup (mirror the brief's ask); if not out-of-the-box, document the fallback (a shared `preview` env, or a CI step that deploys a preview alias).
4. CI integration: extend the backoffice CI ([15 step-02](../15-backoffice-scaffolding/step-02-tooling-and-ci-parity.md)) so merges/PRs trigger the appropriate deploy, matching the backend's flow.
5. Verify a real deploy: `preview` serves the SPA, client routing works (SPA fallback), and it talks to the correct backend per environment.

## Dependencies
**Depends on:** [15 step-03](../15-backoffice-scaffolding/step-03-cloudflare-target-and-config.md).
**Blocks:** [step-02](./step-02-custom-domain-and-secrets.md).

## Implementation notes
- Per §15, this plan is documentation-only — this step describes the Cloudflare project to create and the config to commit; the human operator runs the provisioning.
- **Verify SPA fallback in the deployed environment,** not just locally — a missing fallback makes deep links 404 on refresh in production, a classic SPA-on-CDN bug.
- Keep environment parity with the backend (`preview`/`main`) so promotion mental-models match across repos.
- Preview-per-PR is a "nice if free" per the brief — don't build elaborate infra for it; use whatever Cloudflare provides, else document the simpler fallback.

## Acceptance criteria
- [ ] A Cloudflare project deploys the backoffice SPA with working SPA fallback in a real environment.
- [ ] `production` (from `main`) and `preview` (from `preview`) environments exist with correct per-env API base URLs.
- [ ] Preview-per-PR is enabled if supported, or the fallback is documented.
- [ ] CI triggers deploys matching the backend's branch flow.
- [ ] A deployed preview is verified end-to-end (serves, routes, hits the right backend).

## References
- [15 step-03](../15-backoffice-scaffolding/step-03-cloudflare-target-and-config.md) — hosting model + env config.
- the monorepo's shared `.github/workflows/*` — the branch/deploy model to mirror.
- [step-02](./step-02-custom-domain-and-secrets.md) — domain + secrets on top of this.
