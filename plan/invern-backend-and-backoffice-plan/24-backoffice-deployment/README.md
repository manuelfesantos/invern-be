# 24 — Backoffice Deployment & Environments

**Status:** Not Started · **Priority:** P1 · **Track:** Backoffice App

## Summary
Take the backoffice from "runs locally" to "deployed on Cloudflare": a Cloudflare project with preview and production environments (preview-per-PR if the tooling supports it), driven by a **per-app deploy workflow in the monorepo's shared `.github/workflows/`** (path-filtered on `apps/backoffice`, mirroring `7-30`'s `deploy_backoffice.yaml` and the existing backend deploy), a custom admin domain, environment secrets/config, and a release runbook with Playwright E2E smoke tests for the critical flows (admin login, create/edit a product, view/cancel an order, a destructive user action). Uses the monorepo's single `main`/`preview` branch model.

## Why this matters
An internal tool nobody can reach isn't a tool. This feature makes the backoffice deployable and operable to the same standard as the backend, closes the CORS/domain handshake with the backend, and adds the end-to-end confidence that the highest-risk flows work in a real deployment — not just in unit tests.

## Goals — what "done" looks like
- Cloudflare project deploying the built SPA (Workers static assets, per [15 step-03](../15-backoffice-scaffolding/step-03-cloudflare-target-and-config.md)) with `preview` and `production` environments tied to the branch model, via a path-filtered per-app workflow in the shared `.github/workflows/` (so a backend-only PR doesn't deploy the backoffice, and vice-versa).
- A custom admin domain (e.g. `admin.invernspirit.com`) with the backend CORS allow-listing it ([01 step-03](../01-admin-auth-rbac-cors/step-03-cors-policy-two-origins.md)).
- Environment config/secrets managed correctly (public config only in the SPA; nothing secret in the bundle).
- Playwright E2E smoke tests on the critical flows, run in CI and/or against preview.
- A release runbook (deploy, rollback, preview) mirroring the backend's ops docs.

## User / business impact
Admin staff: a real, reachable, secure admin site. Engineers: repeatable deploys/rollbacks and E2E confidence on the flows that matter.

## In scope / Out of scope
**In scope:** Cloudflare project + envs, custom domain, secrets/config, E2E smoke tests, release runbook.
**Out of scope:** the app features (18–23); backend deployment ([06](../06-observability-ops-readiness/README.md) covers backend ops).

## Dependencies
**Depends on:** [15](../15-backoffice-scaffolding/README.md) (build + Cloudflare target), [16](../16-backoffice-auth-shell/README.md) (something authenticated to deploy/smoke-test), [01 step-03](../01-admin-auth-rbac-cors/step-03-cors-policy-two-origins.md) (CORS for the admin origin). Benefits from all entity features for meaningful E2E.
**Blocks:** None (final feature).

## Steps
| # | Step | Priority | Status | Depends on |
|---|---|---|---|---|
| 01 | [Cloudflare project: preview & production](./step-01-cloudflare-project-preview-prod.md) | P1 | Not Started | 15-backoffice-scaffolding/step-03 |
| 02 | [Custom domain & environment secrets](./step-02-custom-domain-and-secrets.md) | P1 | Not Started | step-01, 01-admin-auth-rbac-cors/step-03 |
| 03 | [E2E smoke tests & release runbook](./step-03-e2e-smoke-and-release-runbook.md) | P1 | Not Started | step-02, 16-backoffice-auth-shell/step-02 |

## Key risks
- **CORS/cookie cross-origin auth in production.** The admin domain and API domain must be configured so the JWT/refresh-cookie flow works cross-subdomain (ties to [01 step-03](../01-admin-auth-rbac-cors/step-03-cors-policy-two-origins.md) and [16 step-01](../16-backoffice-auth-shell/step-01-login-flow.md)). Get this wrong and login works locally but not in prod.
- **Secrets in a public bundle.** A frontend build is public; anything "secret" shipped is leaked. Only public config belongs in the SPA.

## Relevant existing code / references
- The monorepo's `.github/workflows/*` and `apps/backend/wrangler.jsonc` — the shared pipeline + backend deploy to add a sibling backoffice workflow next to; `7-30`'s `.github/workflows/deploy_backoffice.yaml` is the closest reference for a per-app SPA deploy.
- [15 step-03](../15-backoffice-scaffolding/step-03-cloudflare-target-and-config.md) — the hosting model + env config this deploys.
- [01 step-03](../01-admin-auth-rbac-cors/step-03-cors-policy-two-origins.md) — backend CORS that must allow the admin origin.
- [06 step-04](../06-observability-ops-readiness/step-04-ops-runbook.md) — the backend runbook to mirror/cross-link.
