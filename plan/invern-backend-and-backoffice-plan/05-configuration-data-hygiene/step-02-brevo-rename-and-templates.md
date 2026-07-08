---
status: Not Started
priority: P1
feature: 05-configuration-data-hygiene
track: backend-hardening
depends_on: ["05-configuration-data-hygiene/step-01"]
blocks: []
---
# Step 02: Rename the sendgrid adapter to Brevo; remove legacy templates

**Status:** Not Started · **Priority:** P1 · **Feature:** [Configuration & Data Hygiene](./README.md)

## Technical goal
Rename `libs/adapters/sendgrid/**` (and its import alias) to reflect that it is a **Brevo** adapter, and delete the six legacy SendGrid HTML templates, so the email integration's name matches its behavior.

## User impact
None at runtime (pure rename). Prevents engineer confusion and mistaken changes against the wrong provider's API/docs.

## Current state
- `libs/adapters/sendgrid/send-email.ts` POSTs to `https://api.brevo.com/v3/smtp/email` with header `api-key: ENV.BREVO_API_KEY` — the adapter is Brevo in everything but name. Git history confirms the migration ("feat: migrate email sender from SendGrid to Brevo", commit `5905041`).
- The adapter is imported as `@sendgrid-adapter` across the codebase (e.g. `sendCheckoutSuccessfulEmail` in `get-order-from-session-result.ts`).
- `email-templates/sendgrid/*.html` (6 files) and `email-templates/brevo/*.html` (6 files) both exist; live sends reference Brevo template **IDs** (managed in the Brevo dashboard) via `libs/adapters/sendgrid/templates/**` (`template.id` in `send-email.ts`) — the local HTML files are reference copies, with the `sendgrid/` set being pre-migration leftovers.

## Technical steps
1. `git mv libs/adapters/sendgrid libs/adapters/brevo`; rename the path alias `@sendgrid-adapter` → `@brevo-adapter` in `tsconfig.json` (and therefore jest's module mapper — it derives from tsconfig, so it follows automatically) and any eslint import-boundary config that names the path (`eslint.config.mjs` import/no-restricted-paths rules — check for adapter-specific entries).
2. Update every import site (mechanical find/replace of `@sendgrid-adapter`); update internal names that say "sendgrid" where they mean the adapter (folder-level only; don't churn function names like `sendEmail` that are provider-neutral).
3. Delete `email-templates/sendgrid/*.html` (6 files). Keep `email-templates/brevo/*.html` and add a short `email-templates/README.md` noting these are reference copies of templates whose source of truth is the Brevo dashboard (referenced by ID from `libs/adapters/brevo/templates/**`).
4. Confirm `BREVO_DOMAIN`/`BREVO_NAME` read sites during the move (they are in `Env`; verify where the templates/use-cases consume them and that the rename doesn't orphan them).
5. Run lint, typecheck, tests; verify one email path manually in preview (e.g. signup verification email) after deploy.

## Dependencies
**Depends on:** [step-01](./step-01-env-drift-reconciliation.md) (env inventory names the Brevo vars first).
**Blocks:** None.

## Implementation notes
- This is intentionally a **pure rename + deletion** PR: no behavior changes mixed in, so the diff is reviewable at a glance and `git mv` preserves history.
- The eslint config uses `import/no-restricted-paths` (seen as disable-comments referencing it in several files); check whether its zone definitions reference `adapters/sendgrid` literally — a missed path there would silently stop enforcing the layer boundary for the renamed folder.
- Template IDs live in Brevo's dashboard; nothing in this step touches them. If the dashboard templates are ever renamed, the local reference copies should be refreshed — note that in the new README file.

## Acceptance criteria
- [ ] `libs/adapters/brevo/**` exists; no `libs/adapters/sendgrid/**` remains; all imports use `@brevo-adapter`.
- [ ] `email-templates/sendgrid/` is deleted; `email-templates/README.md` explains the Brevo-dashboard source of truth.
- [ ] Lint/typecheck/tests pass; layer-boundary lint rules still apply to the renamed folder.
- [ ] A real email sends successfully in preview after the change.

## References
- `libs/adapters/sendgrid/send-email.ts` — the Brevo call.
- `libs/adapters/sendgrid/templates/**`, `libs/adapters/sendgrid/use-cases/**` — the module being renamed.
- `tsconfig.json` — path alias definitions; `eslint.config.mjs` — import boundary rules.
- `email-templates/sendgrid/*.html`, `email-templates/brevo/*.html` — legacy vs live reference copies.
