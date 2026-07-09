---
status: Done
priority: P1
feature: 05-configuration-data-hygiene
track: backend-hardening
depends_on: ["05-configuration-data-hygiene/step-01"]
blocks: []
---
# Step 05: Version the infra config & rewrite the README setup

**Status:** Done · **Priority:** P1 · **Feature:** [Configuration & Data Hygiene](./README.md)

## Verified implementation (SPIRIT-105)
Note: the Workers migration already committed the live Worker config (`apps/backend/wrangler.jsonc`, with D1/KV/R2/rate-limit bindings), so this step's original premise ("bindings not in version control") was partly overtaken. What was actually done:
- **Infra config is version-controlled (option a).** Both the repo-root `wrangler.toml` (used by the root-level D1 CLI scripts — migrate/seed/query) and `apps/backend/wrangler.jsonc` (the Worker) turned out to be **already tracked** — the `wrangler.toml` line in `.gitignore` was a no-op (git never untracks an already-committed file). Verified `wrangler.toml` holds **only** bindings + resource ids (D1 `database_id`, R2 `stock-local`, KV ids) and **no secrets**, then removed the misleading `.gitignore` entry so the tracked state and the ignore rules agree.
- **Rewrote the README** to current reality: removed the Turso/SQLite tech entry and the Docker prerequisite, fixed the "starts the local database server" phrasing (D1 is embedded in `wrangler dev` — no separate server), refreshed the tech list (Workers+Hono, D1, KV/R2, Stripe, Brevo, Turbo/workspaces monorepo), and added an "Infrastructure & configuration" section documenting where bindings vs secrets live and the local/preview/production environments.

Secrets discipline preserved: secrets stay in `.dev.vars` (gitignored) / Cloudflare, never in the wrangler config or repo. Full environments/secrets runbook still belongs in [06](../06-observability-ops-readiness/README.md) (cross-linked). Verified: type-check clean, jest 88/88.

## Technical goal
Make the backend's infrastructure reproducible from the repo — version-control the wrangler configuration (with secrets excluded) or explicitly document what is dashboard-managed — and rewrite the README's setup section so it matches the current D1/Brevo/wrangler reality.

## User impact
Internal: a new engineer or a disaster-recovery rebuild can recreate the environment from the repo + documented secrets, instead of reverse-engineering it from one laptop and the Cloudflare dashboard.

## Current state
- `wrangler.toml` exists locally but is listed in `.gitignore` — so the binding definitions (D1 database id, R2 bucket, KV namespaces) are **not** in version control. The committed file would be the only record of, e.g., `database_id = "ddf70d9c-..."`.
- `README.md` still describes a **Turso + Docker** local database setup ("Build the Local Database", `db:migrate:local`) and lists Turso/SQLite under technologies — pre-D1-migration instructions.
- `package.json` scripts reference D1 (`db:migrate:local`, `query-local`, `wrangler pages dev`) — the scripts are current even though the README prose isn't.

## Technical steps
1. Decide the wrangler-config strategy (pick one, document why):
   - **(a) Commit `wrangler.toml`** with non-secret bindings (binding names, bucket/db names, ids, compatibility flags) and keep **secrets** in `.dev.vars`/dashboard (never in the toml). Remove `wrangler.toml` from `.gitignore`. This is the standard Cloudflare approach and makes infra reproducible. Verify the file contains no secrets today (it doesn't — only bindings) before committing.
   - **(b) Keep it gitignored** but add a committed `wrangler.example.toml` documenting the required bindings. Weaker (drift-prone) — only if there's a real reason (e.g. per-developer ids).
   - Recommended: **(a)**.
2. If (a): confirm the D1 `database_id`, R2 bucket name, and KV namespace ids are safe to commit (resource identifiers, not credentials — they are). Add the new bindings other features introduce (rate-limit KV from [02](../02-credential-session-hardening/README.md), images bucket from [09](../09-image-management-upload/README.md)) as those land, so the toml stays the source of truth.
3. Rewrite README setup: replace Turso/Docker steps with the real flow — install deps, copy `.env.example` → `.dev.vars`, `wrangler d1 migrations apply invern-db --local`, `npm start`. Update the "Technologies" list (D1, not Turso; Brevo, not SendGrid — coordinate with [step-02](./step-02-brevo-rename-and-templates.md)).
4. Document environments: `local` / `preview` / `production`, the `main`/`preview` branch mapping, and where secrets live per environment (dashboard vs `.dev.vars`). This overlaps the ops runbook in [06](../06-observability-ops-readiness/README.md) — put the canonical version there and link from the README, or vice versa; don't duplicate.
5. Note the D1 migration workflow (`drizzle-kit generate` → `db:migrate:*`) so schema changes from Track B features have a documented path.

## Dependencies
**Depends on:** [step-01](./step-01-env-drift-reconciliation.md) (env docs) and coordinates with [step-02](./step-02-brevo-rename-and-templates.md) (tech list) and [06](../06-observability-ops-readiness/README.md) (runbook).
**Blocks:** None.

## Implementation notes
- **Before committing `wrangler.toml`, scan it for secrets.** It currently holds only bindings/ids, but make it a checklist item — a future edit could add a secret, and un-gitignoring is a one-way door for what's in history.
- Resource ids (D1 database id, KV ids) are not secrets, but if the team treats the account structure as sensitive, option (b) is the fallback.
- Keep README changes prose-focused; the scripts already work, so this is documentation catching up to code.

## Acceptance criteria
- [ ] Infra config is reproducible from the repo (committed `wrangler.toml` with no secrets, or a documented `wrangler.example.toml`).
- [ ] `.gitignore` updated accordingly.
- [ ] README setup steps succeed on a fresh checkout (D1 + `.dev.vars` + `npm start`), with no Turso/Docker references remaining.
- [ ] Environments and secret locations are documented (here or linked to [06](../06-observability-ops-readiness/README.md)).
- [ ] Technologies list reflects D1 + Brevo.

## References
- `wrangler.toml` — currently gitignored; bindings only.
- `.gitignore` — the `wrangler.toml` entry.
- `README.md` — Turso/Docker-era setup + tech list.
- `package.json` — current D1 scripts (already correct).
- [06 — Observability & Operational Readiness](../06-observability-ops-readiness/README.md) — deploy/environments runbook.
