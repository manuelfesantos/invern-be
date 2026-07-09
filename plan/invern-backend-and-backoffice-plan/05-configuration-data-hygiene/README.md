# 05 — Configuration & Data Hygiene

**Status:** Done · **Priority:** P0 · **Track:** Backend Hardening

> **Done (SPIRIT-105):** all 5 steps complete — 01 env reconciliation, 03 dead-code removal, 04 dependency audit (production `npm audit` at **0 vulnerabilities**), 02 sendgrid→Brevo adapter rename, 05 versioned wrangler config + rewritten README. Verified: type-check (root + apps) clean, lint 0 errors, jest 88/88.

> **Done ahead of plan (2026-07-03, user-requested · commit `SPIRIT-105`/`6b605b9`):** the privileged `/private/insert-test-data` endpoint was **removed** and replaced by an idempotent, env-aware CLI seed — `scripts/seed.mjs` (`npm run seed -- --env=local|preview|prod`). It uses deterministic ids + SQLite upserts (re-running never duplicates), runs via `wrangler d1 execute` (no server/secret/Stripe), and gates remote writes behind `--yes`. The now-dead `INSERT_TEST_DATA_SECRET` was removed from `Env`/`.dev.vars`/`.env.example` and the swagger path + middleware allowlist entry were dropped. This overlaps this feature's dead-config cleanup ([step-01](./step-01-env-drift-reconciliation.md)/[step-03](./step-03-remove-dead-turso-and-countries-bucket.md)) and the ops/seeding concerns in feature 06.

## Summary
The configuration surface has drifted from the code: `.env.example` documents variables the code no longer reads (SendGrid, Turso) while omitting ones it requires (Brevo, both Stripe webhook secrets, `COUNTRIES_HOST`, `IMAGES_HOST`); the `Env` interface itself still declares dead `TURSO_*` vars; the email adapter is named `sendgrid` but calls Brevo; `libs/db/turso-db-client.ts` is dead code; `COUNTRIES_BUCKET`/`COUNTRIES_HOST`/`SETUP_COUNTRIES_SECRET` are declared but used nowhere; legacy SendGrid email templates sit beside the live Brevo ones; `wrangler.toml` is **gitignored** so infra bindings aren't version-controlled; the README still describes a Turso/Docker setup; and `npm audit` reports 39 vulnerabilities (20 in production deps, incl. 1 critical). This feature brings config, docs and dependencies back in line with reality.

## Why this matters
Onboarding or disaster recovery against a wrong `.env.example` produces broken deploys with missing webhook secrets — a silent payment-processing outage. Dead/misnamed modules mislead every future change (a new engineer *will* look in `adapters/sendgrid` for SendGrid behavior). Unversioned infra config means the production bindings exist only in the dashboard and one laptop's local file. Known-vulnerable production dependencies are unacceptable at launch.

## Goals — what "done" looks like
- `.env.example` and the `Env` interface list exactly the variables the code reads — nothing more, nothing missing — with accurate comments.
- The email adapter and templates are named for what they do (Brevo); dead Turso code and unused countries-bucket config are removed (after a documented check).
- Infra bindings are reproducible from the repo (wrangler config versioned, secrets excluded) or explicitly documented as dashboard-managed.
- README setup instructions actually work on a fresh machine.
- `npm audit` (production deps) is clean or has documented, accepted exceptions.

## User / business impact
Internal only — engineers, deploys, and incident recovery. The dependency remediation also reduces real security exposure.

## In scope / Out of scope
**In scope:** env/docs/config drift, adapter renaming, dead-code removal, dependency updates, wrangler config versioning decision.
**Out of scope:** any behavior change to email sending or the DB layer; logging/PII (feature 06); new env vars needed by other features (each feature adds its own, this one sets the baseline).

## Dependencies
**Depends on:** None — Phase-0 parallel work.
**Blocks:** None hard; features 01/02/09 add env vars and are easier after the baseline is correct.

## Steps
| # | Step | Priority | Status | Depends on |
|---|---|---|---|---|
| 01 | [Reconcile `.env.example` and the `Env` interface with reality](./step-01-env-drift-reconciliation.md) | P0 | Not Started | — |
| 02 | [Rename the sendgrid adapter to Brevo; remove legacy templates](./step-02-brevo-rename-and-templates.md) | P1 | Not Started | step-01 |
| 03 | [Remove dead Turso client and unused countries-bucket config](./step-03-remove-dead-turso-and-countries-bucket.md) | P1 | Not Started | step-01 |
| 04 | [Dependency vulnerability remediation](./step-04-dependency-vulnerability-remediation.md) | P0 | Not Started | — |
| 05 | [Version the infra config & rewrite the README setup](./step-05-wrangler-config-and-readme.md) | P1 | Not Started | step-01 |

## Key risks
- **"Unused" that's actually used out-of-band.** `IMAGES_HOST` looked like drift but **is used** (email logo URLs) — proof that each removal needs a repo-wide reference check *and* a production-dashboard check (a var can be set in Cloudflare and read via bindings not visible in code greps). Step files call this out per item.
- **Dependency updates breaking the Workers runtime.** `npm audit fix --force` can jump majors (wrangler, stripe). Update deliberately, run typecheck/tests, and validate `wrangler pages dev` still boots.

## Relevant existing code
- `.env.example` — documents `SENDGRID_*`, `TURSO_*`, `PREVIEW_TURSO_*`; missing `BREVO_*`, `STRIPE_CHECKOUT_SECRET`, `STRIPE_PAYMENT_SECRET`, `COUNTRIES_HOST`, `IMAGES_HOST`.
- `libs/entities/env/index.ts` — the real `Env` (still declares `TURSO_AUTH_TOKEN`/`TURSO_CONNECTION_URL`, `COUNTRIES_BUCKET`, `COUNTRIES_HOST`, `SETUP_COUNTRIES_SECRET`).
- `libs/adapters/sendgrid/send-email.ts` — calls `https://api.brevo.com/v3/smtp/email` with `BREVO_API_KEY`.
- `email-templates/sendgrid/*.html` (6 legacy) vs `email-templates/brevo/*.html` (6 live references).
- `libs/db/turso-db-client.ts` — dead (`libs/db/index.ts` re-exports only `./d1-db-client`).
- `wrangler.toml` — present locally but **listed in `.gitignore`**; only binds `INVERN_DB`, `STOCK_BUCKET`, `AUTH_KV`, `VALIDATION_KV`, `STOCK_KV`.
- `README.md` — Turso/Docker-era setup instructions.
- `package.json` / `package-lock.json` — audit target (`@libsql/client` likely removable with the Turso client).
