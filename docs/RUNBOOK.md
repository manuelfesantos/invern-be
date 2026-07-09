# Operations Runbook — invern-be

Practical, copy-pasteable procedures for running the backend. Commands assume the
repo root unless noted. `--env` is `local` | `preview` | `prod`; remote writes
require `--yes`.

## Environments & deploy

| Env | D1 / bindings | Notes |
|-----|---------------|-------|
| `local` | Miniflare, `.wrangler/state` | `npm start` (`wrangler dev --local`, port 8790) |
| `preview` | remote preview resources | staging |
| `prod` | remote production resources | live |

- **Config/secrets** live in `apps/backend/.dev.vars` (local, gitignored) and in
  Cloudflare secrets for preview/prod (`wrangler secret put <NAME>`). Non-secret
  bindings are in `apps/backend/wrangler.jsonc`. See `.env.example` for the full
  variable list.
- **CI** (`.github/workflows/`): `validate-pr-to-preview.yml` and
  `validate-pr-to-main.yml` run the shared `quality-gate.yml` (lint, test,
  type-check, `openapi:check`, `api-client:check`) on every PR. A change that
  touches the HTTP contract must update `swagger.yaml` + `bruno/` (see
  `.claude/rules/api-contract-sync.md`) or the gate fails.
- **Deploy:** `npm run deploy -w backend` (`wrangler deploy`). Confirm whether
  production deploys are manual or via Cloudflare's Git integration for your
  account, and deploy from `main` only after CI is green.

## Rollback

- **Code:** redeploy the previous good commit — `git checkout <sha> && npm run
  deploy -w backend` — or use the Cloudflare dashboard → Workers → Deployments →
  "Rollback" to the prior version.
- **D1 migrations are forward-only.** There is no `migrations down`. A bad schema
  migration cannot be trivially reverted. Mitigations:
  - Prefer **expand/contract**: add columns/tables (additive) in one release,
    backfill, then remove the old shape in a later release — never a destructive
    change coupled to code in the same deploy.
  - Take a backup before any migration (see **D1 backup** below) so you can
    restore if a migration corrupts data.
  - To undo, author a NEW forward migration that reverses the change.

## Scheduled maintenance

The expired-data sweep runs on a **Cloudflare Cron Trigger**, not by an external
caller hitting the (unauthenticated) `/private/expired/*` routes.

- **Where:** `apps/backend/src/scheduled.ts` runs `deleteExpiredCarts`,
  `deleteExpiredCheckoutSessions`, and `deleteExpiredUsers`, each isolated so one
  failure doesn't block the others. Registered in `wrangler.jsonc`:
  `"triggers": { "crons": ["0 3 * * *"] }` (daily 03:00 UTC).
- **Change the schedule:** edit `triggers.crons` and redeploy (versioned in git).
- **Run it manually (local):** `npm start` with `--test-scheduled`, then
  `curl "http://localhost:8790/__scheduled?cron=0+3+*+*+*"`.
- **Run it manually (remote, ad hoc):** the same logic is still reachable as
  `DELETE /private/expired/{carts,sessions,users}` — note these are currently
  unauthenticated (self-gated bypass); gating them is tracked separately, so do
  not expose them publicly.

## Stock recovery (KV/R2 resync from D1)

D1 is the source of truth for stock; KV and R2 mirror it. If they drift:

- **Resync:** `POST /private/stock/setup` with the `SETUP_STOCK_SECRET` in the
  body — re-writes stock for all products from D1 into R2/KV.
- **Spot drift:** compare a product's D1 `stock` against `GET
  /private/stock/{productId}` (local-only read). Suspect drift after failed
  checkouts or partial reservations (see the payment/stock integrity work).

## Admin bootstrap

After RBAC, `/private/*` requires `role = ADMIN`. If **no** user is an admin, the
backoffice is unusable and there is no UI to fix it — this is the escape hatch.

- **Create/reset an admin (preferred — hashes the password correctly):**
  ```bash
  node scripts/create-admin.mjs --email=you@example.com --password='str0ng-pass' --role=ADMIN
  # remote:
  node scripts/create-admin.mjs --email=you@example.com --password='str0ng-pass' --env=prod --yes
  ```
  Idempotent by email (re-running resets that user's password/role).
- **Promote an existing user, once an admin exists:** `PUT /private/users/{id}`
  with `{ "role": "ADMIN" }` (feature 12). This bumps session state so the new
  role takes effect on the next token refresh.
- **Security:** admin creation is privileged. Restrict who can run the script and
  who holds prod D1 access. The last admin cannot be demoted/disabled/deleted via
  the API (guarded).

## Secrets rotation

`wrangler secret put <NAME>` (per env), then redeploy. Blast radius:

- `TOKEN_SECRET` / `REFRESH_TOKEN_SECRET` — rotating **invalidates all existing
  sessions** (everyone must log in again). Expected; schedule accordingly.
- `ENCRYPTION_KEY` / `DEFAULT_IV` / `SALT` — encrypts stored data; rotating
  without a re-encryption migration breaks decryption of existing rows. Do not
  rotate casually.
- `STRIPE_*` — rotate in the Stripe dashboard, then update the secret; in-flight
  webhooks signed with the old secret will fail signature verification.
- `BREVO_API_KEY` — email sending only; low blast radius.

## D1 backup & restore

- **Backup:** `wrangler d1 export invern-db --remote --output=backup-$(date +%F).sql`
  (run manually before migrations; recommended nightly cadence pre-launch).
- **Time Travel:** Cloudflare D1 keeps a 30-day restore window —
  `wrangler d1 time-travel restore invern-db --timestamp=<ISO>` (or `--bookmark`).
- **Restore into local:** `wrangler d1 execute invern-db --local
  --persist-to .wrangler/state --file=backup.sql`.

## Observability & alerting (Honeycomb)

- **Coverage:** every HTTP route runs under `bootstrap` (which installs the
  logger) and the shared `generateErrorResponse` emits an error event for every
  4xx/5xx, so all routes are traced. `/health` is a cheap probe — exclude or
  sample it in Honeycomb to avoid noise. PII is redacted structurally (feature 06
  step 01): logs carry ids, not customer identities.
- **Alerts to configure** (Honeycomb triggers — done in the Honeycomb UI, an
  operator action; recorded here so they're reproducible):

  | Alert | Condition | Start threshold |
  |-------|-----------|-----------------|
  | Elevated 5xx | count of `level:error` / 500 responses | > N per 5 min (tune to baseline) |
  | Webhook failures | Stripe `/stripe/*` handler errors | any in 5 min |
  | Auth failures spike | 401/403 from `/private/*` | unusual spike (possible attack) |
  | Uptime down | external monitor on `GET /health` returning non-200 | 2 consecutive failures |
  | (optional) p99 latency | request duration p99 | > target (set after baseline) |

  Point an external uptime monitor (e.g. Cloudflare Health Checks, UptimeRobot) at
  `GET /health`; it returns 503 when a dependency is down. Start thresholds loose,
  tighten with real data. Define the notification channel (email/Slack/PagerDuty)
  per your setup.

## Alert response (first steps)

- **5xx spike:** check Honeycomb for the top failing `useCase`/route; check
  `GET /health` for a dependency outage (D1/KV/R2).
- **Webhook failures:** verify Stripe signature secrets weren't rotated without
  updating `STRIPE_*`; check the event type is supported.
- **Auth-failure spike:** likely credential stuffing — the login rate limiter
  (`LOGIN_RATE_LIMITER`) should be absorbing it; confirm it's active.
- **Health 503:** the `checks` field names the down dependency (d1/kv/r2); check
  the Cloudflare status + binding config.
