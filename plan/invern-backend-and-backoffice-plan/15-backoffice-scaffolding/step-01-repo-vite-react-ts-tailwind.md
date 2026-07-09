---
status: Done
priority: P0
feature: 15-backoffice-scaffolding
track: backoffice-app
depends_on: []
blocks: ["15-backoffice-scaffolding/step-02", "15-backoffice-scaffolding/step-03", "15-backoffice-scaffolding/step-04"]
---
# Step 01: Create the app `apps/backoffice`: Vite + React + TS strict + Tailwind

**Status:** Done · **Priority:** P0 · **Feature:** [Backoffice Scaffolding, Tooling & Cloudflare Target](./README.md)

## Technical goal
Create the backoffice as a new workspace member at **`apps/backoffice`** inside the monorepo — a Vite + React + TypeScript (strict) app scaffold, Tailwind CSS configured, React Router installed, and a minimal running shell — the empty-but-correct foundation. No new git repo.

## User impact
None yet; produces the app skeleton that hosts every future screen.

## Current state
- The repo is already a monorepo (`apps/backend` + `libs/*`, root `workspaces` + `turbo.json`). The backoffice is added here as a second app under `apps/`, mirroring `7-30`'s `apps/backoffice`.
- No backoffice code exists yet — this is a greenfield *app*, not a greenfield repo.

## Technical steps
1. Create `apps/backoffice/` and register it as a workspace (it already matches the `apps/*` glob in the root `package.json` `workspaces`). Do **not** `git init` — it shares the monorepo's git history and `main`/`preview` branches.
2. Scaffold Vite + React + TS into `apps/backoffice` (`npm create vite@latest apps/backoffice -- --template react-ts`). Give it a workspace `package.json` (`"name": "backoffice"`), and a `tsconfig.json` that **extends the repo's `tsconfig.base.json`** and sets **strict** (`strict: true`, `noUncheckedIndexedAccess`, `noImplicitOverride`, etc.) — codify the brief §14 "no `any` without a documented reason" standard (add the ESLint rule in [step-02](./step-02-tooling-and-ci-parity.md)).
3. Install and configure Tailwind CSS (PostCSS/Vite plugin per current Tailwind docs) scoped to this app, a base `index.css` with the Tailwind layers, and a minimal design-token setup (colors, spacing) that [17](../17-backoffice-design-system/README.md) will extend.
4. Install React Router; set up a minimal router with a placeholder route and an app entry (`main.tsx`, `App.tsx`) that renders a "backoffice" shell placeholder.
5. Establish the source layout convention (e.g. `src/{app,routes,components,features,api,lib,hooks}`) so later features have a home; document it in `apps/backoffice/README.md`.
6. Add turbo tasks so the app runs through the shared graph (`turbo run dev --filter=backoffice`, `build`, `lint`, `type-check`) — see [step-02](./step-02-tooling-and-ci-parity.md).
7. Verify `npm run dev --workspace=backoffice` (or the turbo filter) serves the placeholder and the build produces a static bundle.

## Dependencies
**Depends on:** None (the monorepo already exists).
**Blocks:** [step-02](./step-02-tooling-and-ci-parity.md), [step-03](./step-03-cloudflare-target-and-config.md), [step-04](./step-04-api-client-integration.md).

## Implementation notes
- **Strict TypeScript from the first commit.** Retrofitting strictness later is painful; enable the strictest reasonable settings now while the codebase is empty. Extend the shared base config rather than starting a fresh one so the whole monorepo stays consistent.
- Keep the initial dependency set lean; add libraries (TanStack Query/Table, RHF, Zod) in the steps/features that first need them, so the scaffold stays legible. Prefer hoisting shared deps at the root where the monorepo already does.
- Match the Node/tooling versions the monorepo already pins (root `packageManager`, CI Node version) — no per-app drift.
- Per §15, this plan is documentation-only — this step describes the app to create; it does not create it now.

## Acceptance criteria
- [ ] `apps/backoffice` exists as a workspace member (resolves via `npm ls -w backoffice`); no separate git repo was created.
- [ ] Vite + React + TS strict (extending the base tsconfig) builds and runs; a placeholder route renders.
- [ ] Tailwind is configured and a utility class works in the placeholder.
- [ ] React Router is set up with the documented source layout.
- [ ] The app runs through turbo (`turbo run dev --filter=backoffice`) and `apps/backoffice/README.md` records the stack decisions and links to this plan.

## References
- `apps/backend` — the sibling app to mirror: workspace `package.json`, `tsconfig` extending the base, turbo task wiring.
- The `7-30` monorepo `apps/backoffice` — reference React-app-in-monorepo layout.
- [17](../17-backoffice-design-system/README.md) — extends the Tailwind token setup.
- Root README assumptions — the `apps/backoffice` location + monorepo naming single source of truth.
