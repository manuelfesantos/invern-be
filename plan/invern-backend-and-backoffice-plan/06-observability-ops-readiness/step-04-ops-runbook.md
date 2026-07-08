---
status: Not Started
priority: P1
feature: 06-observability-ops-readiness
track: backend-hardening
depends_on: ["01-admin-auth-rbac-cors/step-02"]
blocks: []
---
# Step 04: Operations runbook (deploy, rollback, scheduled maintenance, recovery)

**Status:** Not Started · **Priority:** P1 · **Feature:** [Observability & Operational Readiness](./README.md)

## Technical goal
Write a single operational runbook (committed to the repo) covering how to deploy, roll back, run and schedule the maintenance jobs, resync stock, bootstrap the first admin, and respond to the alerts from [step-03](./step-03-honeycomb-coverage-alerting.md).

## User impact
None directly; makes incident response and routine ops repeatable for whoever is on call, reducing shopper-facing downtime.

## Current state
- Deploy/rollback is undocumented. Deployment is via Cloudflare Pages tied to the `main`/`preview` branches (PRs into `main` only from `preview` — `.github/workflows/validate-pr-to-main.yml`), but the promotion/rollback mechanics aren't written down.
- The three maintenance routes `functions/private/expired/{carts,sessions,users}/index.ts` (delete expired carts/checkout-sessions/users) have **no documented scheduler** — it's unknown from the repo whether a Cloudflare Cron Trigger, an external cron, or nothing invokes them. [01 step-02](../01-admin-auth-rbac-cors/step-02-private-middleware-rbac.md) must classify and possibly re-auth these; the runbook records the outcome.
- `functions/private/stock/setup/index.ts` (secret-gated) rebuilds KV+R2 stock from D1 — the recovery tool for stock drift, undocumented.
- There is no documented way to create the first `ADMIN` user (needed before the backoffice can log in — [01](../01-admin-auth-rbac-cors/README.md)/[16](../16-backoffice-auth-shell/README.md)). `users.role` defaults to `USER`; promotion currently requires a direct DB update (`wrangler d1 execute`) since no admin API sets role until [12](../12-user-admin-actions/README.md).

## Technical steps
1. Create `docs/RUNBOOK.md` (or `OPERATIONS.md`) with these sections:
   - **Environments & deploy:** `local`/`preview`/`production`, branch mapping, how a merge to `preview`/`main` triggers a Cloudflare deploy, and where env/secrets live per environment (cross-link [05 step-05](../05-configuration-data-hygiene/step-05-wrangler-config-and-readme.md)).
   - **Rollback:** how to roll back a bad production deploy (Cloudflare Pages "rollback to previous deployment" / re-deploying a prior commit), and D1 migration rollback caveats (D1 migrations are forward-only — document the mitigation: expand/contract migrations, backups).
   - **Scheduled maintenance:** the definitive answer to how `/private/expired/*` are invoked (set up a Cloudflare Cron Trigger if none exists), their schedule, and their auth (per [01 step-02](../01-admin-auth-rbac-cors/step-02-private-middleware-rbac.md)).
   - **Stock recovery:** when/how to run `/private/stock/setup` to resync KV+R2 from D1, and how to spot drift (links to [03](../03-payment-stock-integrity/README.md)).
   - **Admin bootstrap:** the exact command to promote a user to `ADMIN` (via `wrangler d1 execute` until [12](../12-user-admin-actions/README.md) exists; via the backoffice after), and the security note that this is a privileged action.
   - **Alert response:** for each [step-03](./step-03-honeycomb-coverage-alerting.md) alert, the first diagnostic step and likely causes.
   - **Secrets rotation:** how to rotate `TOKEN_SECRET`/`REFRESH_TOKEN_SECRET`/`ENCRYPTION_KEY`/Stripe/Brevo keys, and the blast radius (rotating token secrets invalidates all sessions — ties to [02](../02-credential-session-hardening/README.md)).
2. If `/private/expired/*` have no scheduler, define and (with the human operator) configure a Cloudflare Cron Trigger; capture the config in the runbook and, if possible, in `wrangler.toml` (`[triggers] crons = [...]`) so it's versioned.
3. Add the D1 backup approach: document `wrangler d1 export` (or Time Travel) as the backup/restore mechanism and a recommended cadence before launch.
4. Link the runbook from the README.

## Dependencies
**Depends on:** [01 step-02](../01-admin-auth-rbac-cors/step-02-private-middleware-rbac.md) (maintenance-route auth outcome). Coordinates with [05 step-05](../05-configuration-data-hygiene/step-05-wrangler-config-and-readme.md) and [step-03](./step-03-honeycomb-coverage-alerting.md).
**Blocks:** None (but admin bootstrap is a prerequisite the backoffice needs — surfaced in [16](../16-backoffice-auth-shell/README.md)).

## Implementation notes
- **D1 migrations are forward-only.** The rollback section must be honest about this: a bad schema migration can't be trivially reverted, so the mitigation is expand/contract migrations + backups, not "roll back the migration." State it plainly.
- The admin-bootstrap gap is real and easy to miss: after [01](../01-admin-auth-rbac-cors/README.md) enforces `ADMIN`-only, if **no** user has `role = ADMIN`, the backoffice is unusable and there's no UI to fix it. The runbook's `wrangler d1 execute "UPDATE users SET role='ADMIN' WHERE email=..."` procedure is the escape hatch — make it prominent.
- Keep the runbook practical and copy-pasteable (actual commands), not abstract prose.

## Acceptance criteria
- [ ] `docs/RUNBOOK.md` exists covering deploy, rollback, scheduled maintenance, stock recovery, admin bootstrap, alert response, and secrets rotation.
- [ ] The invocation mechanism for `/private/expired/*` is documented (and a Cron Trigger configured if none existed), ideally versioned in `wrangler.toml`.
- [ ] D1 backup/restore and forward-only-migration caveats are documented.
- [ ] The admin-bootstrap procedure is explicit and prominent.
- [ ] Runbook linked from the README.

## References
- `functions/private/expired/{carts,sessions,users}/index.ts` — maintenance routes.
- `functions/private/stock/setup/index.ts` — stock resync tool.
- `.github/workflows/validate-pr-to-main.yml` — promotion flow.
- `wrangler.toml` — where a `[triggers] crons` block and bindings live.
- `db/schema.ts` — `users.role` default `USER` (admin bootstrap context).
- [05 step-05](../05-configuration-data-hygiene/step-05-wrangler-config-and-readme.md), [01 step-02](../01-admin-auth-rbac-cors/step-02-private-middleware-rbac.md) — cross-linked docs/decisions.
