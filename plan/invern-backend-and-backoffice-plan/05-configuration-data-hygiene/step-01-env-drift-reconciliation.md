---
status: Done
priority: P0
feature: 05-configuration-data-hygiene
track: backend-hardening
depends_on: []
blocks: ["05-configuration-data-hygiene/step-02", "05-configuration-data-hygiene/step-03", "05-configuration-data-hygiene/step-05"]
---
# Step 01: Reconcile `.env.example` and the `Env` interface with reality

**Status:** Done · **Priority:** P0 · **Feature:** [Configuration & Data Hygiene](./README.md)

## Verified implementation (SPIRIT-105)
Reconciled all three sources of truth via per-key grep of actual read sites. Rather than the planned two-phase split (inventory here, delete in step-03), the deletions were done in the same pass since they were unambiguously dead.

- **`libs/entities/env/index.ts` rewritten** into commented groups (bindings / runtime config / crypto / stripe / brevo / google / cache / setup). Removed 7 dead keys: `HONEYCOMB_API_KEY`, `HONEYCOMB_DATASET`, `COUNTRIES_BUCKET`, `COUNTRIES_HOST`, `SETUP_COUNTRIES_SECRET`, `TURSO_AUTH_TOKEN`, `TURSO_CONNECTION_URL` (each verified 0 live reads; TURSO_* only touched the dead `turso-db-client.ts`).
- **`.env.example` rewritten** to match code reality: removed `SENDGRID_*`, `TURSO_*`, `PREVIEW_TURSO_*`, `SETUP_COUNTRIES_SECRET`, `HONEYCOMB_*`; added `BREVO_API_KEY`/`BREVO_DOMAIN`/`BREVO_NAME`, `STRIPE_CHECKOUT_SECRET`, `STRIPE_PAYMENT_SECRET`, `IMAGES_HOST`. Grouped with accurate per-var comments; placeholders only, no real values.
- **`test/harness.ts` `makeTestEnv`** pruned of the same removed keys so the fake `Env` still satisfies the interface (type-check green).

Note: `COUNTRIES_HOST` was confirmed dead (0 reads) and removed — the plan flagged it as "verify"; verification said drop it. Production/preview dashboard var reconciliation still relies on whoever holds dashboard access (see note below); the code-read inventory is authoritative for what the Worker actually consumes.

Verified: `npm run type-check` (root + backend) clean, 73 tests pass.

## Technical goal
Make `libs/entities/env/index.ts` (the `Env` interface) and `.env.example` describe exactly the configuration the code actually reads — verified variable-by-variable — so a fresh environment can be stood up from the docs alone.

## User impact
Internal: correct onboarding/DR. Indirect production impact: prevents deploys with missing Stripe webhook secrets or Brevo keys (payment confirmation + all transactional email would silently fail).

## Current state
Verified drift between the three sources of truth (code reads vs `Env` interface vs `.env.example`):
- **In `.env.example` but read nowhere:** `SENDGRID_API_KEY`, `SENDGRID_DOMAIN`, `SENDGRID_NAME`, `TURSO_CONNECTION_URL`, `TURSO_AUTH_TOKEN`, `PREVIEW_TURSO_CONNECTION_URL`, `PREVIEW_TURSO_AUTH_TOKEN`.
- **Read by code but missing from `.env.example`:** `BREVO_API_KEY` (`libs/adapters/sendgrid/send-email.ts`), `BREVO_DOMAIN`/`BREVO_NAME` (declared in `Env`; confirm their read sites in the adapter templates), `STRIPE_CHECKOUT_SECRET` + `STRIPE_PAYMENT_SECRET` (webhook handlers), `IMAGES_HOST` (email logo URLs in `libs/adapters/sendgrid/templates/*` and `use-cases/signup.ts`), `COUNTRIES_HOST` (declared; verify — likely unused, handled in step-03).
- **In `Env` but dead:** `TURSO_AUTH_TOKEN`, `TURSO_CONNECTION_URL` (only `libs/db/turso-db-client.ts` would use them — itself dead), `COUNTRIES_BUCKET`, `SETUP_COUNTRIES_SECRET` (zero references outside the interface — verified by grep). Removal happens in step-03; this step just inventories.
- Bindings (`INVERN_DB`, KV namespaces, `STOCK_BUCKET`) are not env-file material but belong in the same documentation (they come from `wrangler.toml`/dashboard — step-05).

## Technical steps
1. Build the authoritative inventory: for each key in `Env`, grep its read sites; for each `.env.example` line, find the consuming code. Record the three-way table in the PR description (it becomes the review artifact).
2. Rewrite `.env.example`: remove the dead SendGrid/Turso entries; add `BREVO_API_KEY`, `BREVO_DOMAIN`, `BREVO_NAME`, `STRIPE_CHECKOUT_SECRET`, `STRIPE_PAYMENT_SECRET`, `IMAGES_HOST` (and `COUNTRIES_HOST` only if step-03's check decides it stays); keep the helpful per-var comments style already present.
3. Update `Env` to match — but **defer the deletions** of `TURSO_*`/`COUNTRIES_BUCKET`/`SETUP_COUNTRIES_SECRET` to step-03 (which owns the dead-code removal and its verification) to keep this PR purely additive/documentational. Mark them `/** @deprecated remove in step-03 */` here.
4. Add any variables features 01–02 are introducing concurrently (`BACKOFFICE_HOST`, rate-limit KV) if those PRs have landed — coordinate to avoid churn.
5. Cross-check `.dev.vars` guidance in the README (the README tells users to create `.dev.vars`; `.env.example` is the template) — make the pairing explicit: "copy `.env.example` → `.dev.vars` for `wrangler pages dev`".

## Dependencies
**Depends on:** None.
**Blocks:** [step-02](./step-02-brevo-rename-and-templates.md), [step-03](./step-03-remove-dead-turso-and-countries-bucket.md), [step-05](./step-05-wrangler-config-and-readme.md).

## Implementation notes
- **Check the production dashboard too.** A var can be configured in Cloudflare Pages settings and read by code paths not exercised locally. The grep inventory covers code reads; have whoever holds dashboard access export the production/preview var list and diff it against the inventory before declaring anything dead.
- `IMAGES_HOST` is the cautionary tale: superficially unused, actually load-bearing for every transactional email's logo. It also matters to [09 — Image Management](../09-image-management-upload/README.md), which will likely serve uploaded images from the same host — note the connection in the inventory.
- Never put real secret **values** in `.env.example` — placeholder + comment only (current file does this correctly; keep it).

## Acceptance criteria
- [ ] Three-way inventory (code ⇄ `Env` ⇄ `.env.example`) exists in the PR.
- [ ] `.env.example` contains every var the code reads (modulo step-03 deletions) and none it doesn't.
- [ ] A fresh `.dev.vars` created from the new `.env.example` boots `npm start` (wrangler pages dev) without missing-var errors.
- [ ] Webhook secrets and Brevo vars are present and documented.
- [ ] Deprecated-but-not-yet-deleted vars are marked in `Env` with a pointer to step-03.

## References
- `.env.example` — the drifted template.
- `libs/entities/env/index.ts` — the `Env` interface.
- `libs/adapters/sendgrid/send-email.ts` — `BREVO_API_KEY` read.
- `functions/stripe/session-result/index.ts` / `payment-intent/index.ts` — `STRIPE_CHECKOUT_SECRET` / `STRIPE_PAYMENT_SECRET` reads.
- `libs/adapters/sendgrid/templates/**`, `libs/adapters/sendgrid/use-cases/signup.ts` — `IMAGES_HOST` reads.
- `README.md` — `.dev.vars` instructions to align.
