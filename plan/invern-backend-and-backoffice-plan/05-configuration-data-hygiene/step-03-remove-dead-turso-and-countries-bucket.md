---
status: Done
priority: P1
feature: 05-configuration-data-hygiene
track: backend-hardening
depends_on: ["05-configuration-data-hygiene/step-01"]
blocks: []
---
# Step 03: Remove dead Turso client and unused countries-bucket config

**Status:** Done · **Priority:** P1 · **Feature:** [Configuration & Data Hygiene](./README.md)

## Verified implementation (SPIRIT-105)
Done together with step-01 (env) and step-04 (audit) in one PR.

- **Deleted `libs/db/turso-db-client.ts`** (`git rm`) — sole user of `@libsql/client` + `drizzle-orm/libsql` + `TURSO_*`. Confirmed `libs/db/d1-db-client.ts` uses drizzle's D1 driver, not libsql.
- **Removed `@libsql/client`** from `package.json` (`npm uninstall`).
- **Removed** `TURSO_AUTH_TOKEN`, `TURSO_CONNECTION_URL`, `COUNTRIES_BUCKET`, `COUNTRIES_HOST`, `SETUP_COUNTRIES_SECRET` (+ `HONEYCOMB_*`) from `Env` — see step-01. `wrangler.jsonc` binds only `STOCK_BUCKET`, so no binding to drop.
- **Removed stale `turso` entry** from `.gitignore`.
- **Bonus dead-dep removal (folded from the audit trace):** `@cloudflare/pages-plugin-honeycomb` — the last Pages-plugin vestige, referenced only as a `Logger` type alias in `libs/utils/logger/honeycomb-logger.ts`. Deleted that file and inlined a strict local `Logger` interface (`addData`/`log`) into `logger-store.ts`, dropped the never-set-never-read `LoggerInstance.currentLog`/`incrementCurrentLog`, and replaced the loose mutate-and-cast with `Object.assign`. Also removed `worker-auth-providers` (see step-04) after porting Google OAuth to native fetch.

**Decision recorded:** image hosting will **not** reuse the abandoned `COUNTRIES_BUCKET` — [09](../09-image-management-upload/README.md) provisions its own bucket. `COUNTRIES_BUCKET` was scaffolding, now removed.

Verified: `npm run type-check` (root + backend) clean, 73 tests pass, `npm audit --omit=dev` → 0.

## Technical goal
Delete verified-dead code and configuration: the Turso DB client and its env vars/dependency, and the never-bound `COUNTRIES_BUCKET`/`SETUP_COUNTRIES_SECRET` (and `COUNTRIES_HOST` if confirmed unused) — after a final reference + dashboard check, and after resolving whether the half-finished countries bucket was meant for the image-hosting gap.

## User impact
None — removing code and config nothing executes. Reduces bundle size and eliminates misleading dead paths.

## Current state
- `libs/db/turso-db-client.ts` exists but `libs/db/index.ts` re-exports only `./d1-db-client`; grep finds no importer of the Turso client except the file itself and the `Env` interface. The project migrated to D1 (commit `0d1d573` "feat: migrate to cloudflare d1 for database"). `@libsql/client` is still a dependency.
- `Env` declares `COUNTRIES_BUCKET: R2Bucket`, `COUNTRIES_HOST: string`, `SETUP_COUNTRIES_SECRET: string`. `wrangler.toml` binds **only** `STOCK_BUCKET` (no `COUNTRIES_BUCKET`). Grep: `COUNTRIES_BUCKET`/`SETUP_COUNTRIES_SECRET` are referenced **only** in `libs/entities/env/index.ts`; `COUNTRIES_HOST` also only in `Env`. So these are declared-but-unbound-and-unread.
- **Decision point flagged by the brief:** was `COUNTRIES_BUCKET` intended for something like image hosting (the gap in [09](../09-image-management-upload/README.md))? There is no code suggesting so — the image upload feature will provision its own R2 binding. Treat `COUNTRIES_BUCKET` as abandoned scaffolding.

## Technical steps
1. Final verification pass (do not skip): repo-wide grep for `turso`/`Turso`/`TURSO`, `libsql`, `COUNTRIES_BUCKET`, `COUNTRIES_HOST`, `SETUP_COUNTRIES_SECRET`; plus a production/preview dashboard var check (some may be *set* in Cloudflare even though unread — setting-without-reading is harmless to remove, but confirm nothing external depends on them).
2. Delete `libs/db/turso-db-client.ts`. Remove `TURSO_AUTH_TOKEN`/`TURSO_CONNECTION_URL` from `Env`. Remove `@libsql/client` from `package.json` (and lockfile) **iff** grep confirms no other importer (the D1 client uses drizzle's D1 driver, not libsql — verify `d1-db-client.ts`).
3. Remove `COUNTRIES_BUCKET`, `COUNTRIES_HOST`, `SETUP_COUNTRIES_SECRET` from `Env`. Confirm `wrangler.toml` has no binding to drop (it doesn't). If any were set in the dashboard, remove them there and record it in the runbook.
4. Record the decision that image hosting will **not** reuse `COUNTRIES_BUCKET` — [09](../09-image-management-upload/README.md) provisions a dedicated `IMAGES_BUCKET`. Cross-link so the abandoned-scaffolding question is closed, not reopened.
5. Typecheck + tests + `wrangler pages dev` boot to confirm nothing referenced the removed symbols.

## Dependencies
**Depends on:** [step-01](./step-01-env-drift-reconciliation.md) (which marks these `@deprecated` first).
**Blocks:** None. Informs [09](../09-image-management-upload/README.md)'s bucket decision.

## Implementation notes
- Keep this PR limited to *verified*-dead removals. If the dashboard check surfaces that any var is unexpectedly consumed by an external system, leave it and note why.
- Removing a prod dependency (`@libsql/client`) can shift the lockfile and transitive audit surface — re-run `npm audit` after and fold results into [step-04](./step-04-dependency-vulnerability-remediation.md).
- `.gitignore` currently ignores a `turso` path/dir — remove that stale entry too while here.

## Acceptance criteria
- [ ] `libs/db/turso-db-client.ts` deleted; no importers remain; `@libsql/client` removed if unused.
- [ ] `TURSO_*`, `COUNTRIES_BUCKET`, `COUNTRIES_HOST`, `SETUP_COUNTRIES_SECRET` removed from `Env`.
- [ ] Dashboard checked; any stray vars removed there and noted in the runbook.
- [ ] Decision recorded that [09](../09-image-management-upload/README.md) uses a dedicated image bucket, not `COUNTRIES_BUCKET`.
- [ ] Typecheck/tests/dev-server boot all pass.

## References
- `libs/db/turso-db-client.ts` — dead client.
- `libs/db/index.ts`, `libs/db/d1-db-client.ts` — the live D1 path.
- `libs/entities/env/index.ts` — vars to remove.
- `wrangler.toml` — bindings (no `COUNTRIES_BUCKET`).
- `.gitignore` — stale `turso` entry.
- [09 — Image Management & Upload](../09-image-management-upload/README.md) — the image-bucket decision.
