---
status: Not Started
priority: P1
feature: 24-backoffice-deployment
track: backoffice-app
depends_on: ["24-backoffice-deployment/step-02", "16-backoffice-auth-shell/step-02"]
blocks: []
---
# Step 03: E2E smoke tests & release runbook

**Status:** Not Started · **Priority:** P1 · **Feature:** [Backoffice Deployment & Environments](./README.md)

## Technical goal
Add Playwright E2E smoke tests for the critical backoffice flows and write the release runbook (deploy, rollback, preview, first-admin bootstrap), so releases are verified and repeatable.

## User impact
None directly; protects admin staff from broken releases of the flows they depend on most.

## Current state
- The app deploys to a custom domain with working auth ([step-01](./step-01-cloudflare-project-preview-prod.md)/[step-02](./step-02-custom-domain-and-secrets.md)); unit/component tests exist via Vitest ([15 step-02](../15-backoffice-scaffolding/step-02-tooling-and-ci-parity.md)).
- No E2E tests or release runbook yet.

## Technical steps
1. Add Playwright with a small, high-value E2E suite covering the brief's critical flows:
   - Admin login (and non-admin/invalid rejection).
   - Create and edit a product.
   - View an order and cancel it (a destructive flow).
   - A destructive user action (e.g. role change or disable) — the most privilege-sensitive path.
2. Decide the E2E target/data strategy: run against a seeded `preview` environment or a local stack with test data (the backend's D1 seed — `npm run seed` / `scripts/seed.mjs`), with a known test admin. Document how the test admin is provisioned (ties to the admin-bootstrap runbook).
3. Wire E2E into CI (against preview post-deploy, or on a schedule) — keep it a small, reliable suite, not a flaky sprawl.
4. Write the backoffice release runbook (mirroring [06 step-04](../06-observability-ops-readiness/step-04-ops-runbook.md)): how to deploy to preview/prod, how to roll back a bad Cloudflare deployment, how PR previews work, the first-admin bootstrap dependency (no `ADMIN` → can't log in; created via the backend runbook), and env/secret locations.
5. Link the runbook from the backoffice README and cross-reference the backend runbook.

## Dependencies
**Depends on:** [step-02](./step-02-custom-domain-and-secrets.md), [16 step-02](../16-backoffice-auth-shell/step-02-protected-routing-and-refresh.md). Meaningful E2E benefits from the entity features (18–22) existing.
**Blocks:** None (final step of the program).

## Implementation notes
- **Keep E2E small and reliable.** A handful of critical-path tests that always pass is far more valuable than a large flaky suite. Target the flows the brief names (login, product create/edit, order view/cancel) plus one destructive user action.
- E2E needs real auth — provision a dedicated test admin (via the bootstrap procedure) and a seeded dataset; don't hardcode credentials in the repo (use CI secrets).
- The runbook's **first-admin bootstrap** note is the same gotcha as the backend's: without an `ADMIN`, the whole app (and the login E2E) can't work — make it prominent and point at [06 step-04](../06-observability-ops-readiness/step-04-ops-runbook.md).
- Rollback for a static SPA is usually "redeploy the previous Cloudflare deployment" — document the exact steps.

## Acceptance criteria
- [ ] Playwright E2E covers admin login, product create/edit, order view/cancel, and a destructive user action, running reliably in CI.
- [ ] The E2E data/admin strategy is documented (no hardcoded creds; seeded data).
- [ ] A backoffice release runbook covers deploy, rollback, PR previews, first-admin bootstrap, and env/secrets.
- [ ] The runbook is linked from the README and cross-references the backend runbook.

## References
- Brief §3/§14 — the critical flows to E2E.
- [16 step-02](../16-backoffice-auth-shell/step-02-protected-routing-and-refresh.md) — auth flow under test.
- `scripts/seed.mjs` (D1 seed via `npm run seed`) — seeding for E2E data.
- [06 step-04](../06-observability-ops-readiness/step-04-ops-runbook.md) — the backend runbook + admin-bootstrap procedure to mirror/cross-link.
