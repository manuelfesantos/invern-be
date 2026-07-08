---
status: Not Started
priority: P0
feature: 15-backoffice-scaffolding
track: backoffice-app
depends_on: ["15-backoffice-scaffolding/step-01"]
blocks: []
---
# Step 02: Join the shared tooling & CI (workspaces, turbo, lint, PR gate)

**Status:** Not Started · **Priority:** P0 · **Feature:** [Backoffice Scaffolding, Tooling & Cloudflare Target](./README.md)

## Technical goal
Wire `apps/backoffice` into the monorepo's **existing shared** tooling — ESLint + Prettier, Husky, turbo, and the GitHub Actions PR gate — so it inherits the same engineering-hygiene standard as `apps/backend` without a parallel setup. The only genuinely new pieces are React-specific lint rules and a React test runner.

## User impact
None directly; enforces code quality automatically so the backoffice stays maintainable.

## Current state
- The monorepo already has: an ESLint flat config (`eslint.config.mjs`) with import-boundary rules, Prettier, Husky (`.husky/pre-commit` runs lint; `commit-msg`/`pre-push` block direct main/preview commits and enforce the `SPIRIT-<n>:` message format), a `turbo.json` task graph, and the CI gate that runs typecheck/lint/test (`04 step-03`). The backoffice must be **covered by** these, not given its own.
- Post [step-01](./step-01-repo-vite-react-ts-tailwind.md) the app has only the Vite defaults and no lint/test wiring.

## Technical steps
1. ESLint: **extend the root flat config** with a React block scoped to `apps/backoffice/**` (typescript-eslint, react-hooks, jsx-a11y for the accessibility bar in brief §14; keep the existing `no-explicit-any`/import rules). Don't fork a second ESLint setup — add to the shared one so `npm run lint` covers every app.
2. Prettier: the app inherits the root Prettier config automatically — no per-app config; just confirm formatting is identical.
3. Husky: the shared `.husky/*` hooks already apply repo-wide (pre-commit lint, `commit-msg`/`pre-push` guards). Confirm they run against backoffice changes; no new hooks.
4. Testing tooling: install **Vitest + React Testing Library** for the frontend app (the React analog of the backend's Jest — the two coexist per app) and a `test` script; add a trivial smoke test so the app's test task isn't empty. Register it in turbo.
5. CI: **extend the shared PR gate**, not add new workflows — make the `preview` and `main` gates run the backoffice's lint/type-check/test via turbo (path-aware so a backend-only PR doesn't rebuild the SPA, and vice-versa). Reuse the corrected gate shape from [04 step-03](../04-testing-quality-gates/step-03-extend-main-ci-gate.md).
6. Turbo/scripts: give the app `lint`, `type-check`, `test`, `build`, `dev` tasks that plug into `turbo.json`; run them via `--filter=backoffice`. Names match `apps/backend` for muscle-memory consistency.
7. Document the standards in `apps/backoffice/README.md` (strict TS, a11y, no-any-without-reason, test-the-risky-flows), pointing at the shared root config as the source of truth.

## Dependencies
**Depends on:** [step-01](./step-01-repo-vite-react-ts-tailwind.md).
**Blocks:** None (but every later feature relies on the gates).

## Implementation notes
- **Extend, don't duplicate.** The whole point of the monorepo is one ESLint/Prettier/Husky/CI. Adding a second parallel config is the anti-goal; scope React rules by path within the shared config.
- Add `jsx-a11y` early: the brief requires accessible-by-default screens; catching a11y issues at lint time is cheaper than auditing later ([17 step-04](../17-backoffice-design-system/step-04-states-and-accessibility.md) covers the runtime side).
- Backend uses Jest, the SPA uses Vitest — that's fine; each app declares its own `test` task and turbo runs them together. Don't try to unify the runners.
- Don't gate on coverage thresholds yet (mirror the backend's decision to defer that); gate on tests passing.

## Acceptance criteria
- [ ] The root ESLint config gains a React+TS+a11y block for `apps/backoffice`; `npm run lint` (repo-wide) passes on the scaffold.
- [ ] The app inherits the shared Prettier + Husky hooks (verified by a formatting/commit check) — no per-app duplicates.
- [ ] Vitest + RTL are installed with a passing smoke test, registered as the app's turbo `test` task.
- [ ] The shared PR gate runs backoffice lint + type-check + test (path-aware) for PRs into `preview` and `main`.
- [ ] Turbo tasks + script names align with `apps/backend`; standards documented in the app README.

## References
- `eslint.config.mjs`, `.husky/*`, the shared PR-gate workflow, `turbo.json` — the shared setup to extend.
- [04 step-03](../04-testing-quality-gates/step-03-extend-main-ci-gate.md) — the corrected gate shape.
- [17 step-04](../17-backoffice-design-system/step-04-states-and-accessibility.md) — runtime a11y counterpart.
