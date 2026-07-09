# 15 — Backoffice Scaffolding, Tooling & Cloudflare Target

**Status:** Done · **Priority:** P0 · **Track:** Backoffice App

## Summary
Stand up the backoffice application as a **new app inside the monorepo** (`apps/backoffice`): Vite + React + TypeScript (strict), Tailwind CSS, wired into the repo's **shared** tooling (workspaces + turbo, ESLint + Prettier + Husky) and the **shared** GitHub Actions pipeline (the path-aware PR gate already covers new apps; add a per-app deploy workflow), a Cloudflare deployment target, environment-driven configuration, and the in-repo typed API client + TanStack Query data layer wired in. This is the foundation every other Track C feature builds on.

## App location & core stack (recorded decisions — see root README assumptions)
The backoffice is **not** a separate repo. It is a new workspace member at **`apps/backoffice`** in the `invern-spirit` monorepo (the renamed `invern-be`), alongside `apps/backend` and mirroring the `7-30` layout. It inherits the monorepo's git, branches, `turbo` task graph, base TS config, lint/format rules and CI — so "tooling parity" here means *joining* the shared setup, not replicating it. Core stack, per brief §3 and this plan's audit:
- **Build:** Vite + React 18 + TypeScript **strict** (extends the repo's `tsconfig.base.json`).
- **Hosting:** **Cloudflare Workers static assets** (Cloudflare's current recommended way to host a built SPA on Workers). Rationale recorded in [step-03](./step-03-cloudflare-target-and-config.md); Pages is the documented fallback.
- **Styling:** Tailwind CSS.
- **Routing:** React Router. **Server state:** TanStack Query. **Forms:** React Hook Form + Zod. **Tables:** TanStack Table. **API types:** consumed from the in-repo workspace package `packages/api-client`, generated from the backend's `swagger.yaml` ([14](../14-api-contract-typed-client/README.md)) — a workspace dependency, no publish/registry step.
- **Branches/envs:** the monorepo's `main` (prod) + `preview` (staging) — one strategy for every app.

## Why this matters
Everything in Track C depends on a correct, high-standard foundation. Getting strict TypeScript, the workspace-linked client, env-driven config, and shared CI right *once* here is what makes the entity screens fast to build and consistent — and what delivers the brief's "as good of code as possible" bar structurally rather than by per-screen effort.

## Goals — what "done" looks like
- `apps/backoffice` exists as a workspace member with Vite + React + TS strict + Tailwind, building and running locally via the monorepo's turbo tasks (`turbo run dev --filter=backoffice`, etc.).
- Tooling parity by inheritance: shares the root ESLint/Prettier config and Husky hooks; the shared PR gate runs lint + typecheck + test for the backoffice (path-aware), no separate CI repo.
- A Cloudflare deploy target is chosen and configured (Workers static assets), with `main`/`preview` environments, deployed by a per-app workflow in the shared `.github/workflows/`.
- Config is environment-driven (API base URL per local/preview/prod) — no hardcoded URLs or secrets.
- The in-repo typed client (`packages/api-client`, [14](../14-api-contract-typed-client/README.md)) and a TanStack Query provider are wired in with a working authenticated call pattern.

## User / business impact
Internal/engineering only — but it's the substrate for every admin-facing screen. Wrong foundations here tax every later feature.

## In scope / Out of scope
**In scope:** the `apps/backoffice` workspace, build tooling, TS strict config, Tailwind, joining the shared lint/format/hooks + turbo pipeline + PR gate, Cloudflare target + env config, typed-client (workspace dep) + TanStack Query wiring.
**Out of scope:** the repo rename/consolidation itself and migrating other apps in (future execution work, tracked in the root README); auth/login (feature [16](../16-backoffice-auth-shell/README.md)), the component library ([17](../17-backoffice-design-system/README.md)), any entity screens, production domain/secrets provisioning (feature [24](../24-backoffice-deployment/README.md)).

## Dependencies
**Depends on:** [14](../14-api-contract-typed-client/README.md) (the `packages/api-client` workspace package) for [step-04](./step-04-api-client-integration.md); the rest can start immediately against the existing monorepo. Reuses the monorepo's CI ([04 step-03](../04-testing-quality-gates/step-03-extend-main-ci-gate.md)).
**Blocks:** [16](../16-backoffice-auth-shell/README.md), [17](../17-backoffice-design-system/README.md), and thus all backoffice screens; [24](../24-backoffice-deployment/README.md).

## Steps
| # | Step | Priority | Status | Depends on |
|---|---|---|---|---|
| 01 | [Create the app: `apps/backoffice` (Vite + React + TS strict + Tailwind)](./step-01-repo-vite-react-ts-tailwind.md) | P0 | Done | — |
| 02 | [Join the shared tooling & CI (workspaces, turbo, lint, PR gate)](./step-02-tooling-and-ci-parity.md) | P0 | Done | step-01 |
| 03 | [Cloudflare target & environment-driven config](./step-03-cloudflare-target-and-config.md) | P0 | Done | step-01 |
| 04 | [Typed API client (workspace dep) + TanStack Query data layer](./step-04-api-client-integration.md) | P0 | Done | step-01, 14-api-contract-typed-client/step-03 |

## Key risks
- **Workspace wiring, not repo creation.** The backoffice must register as an `apps/*` workspace, extend the base tsconfig, and slot into the turbo pipeline + path-aware PR gate — mirror exactly how `apps/backend` is wired so tooling stays uniform.
- **Workers-vs-Pages ambiguity.** Cloudflare's SPA-on-Workers story evolved; verify the current recommended `wrangler` config for static assets against live docs at build time rather than assuming.
- **TypeScript strict from day one is much cheaper than retrofitting.** Enforce it in the initial tsconfig; don't defer.

## Relevant existing code / references
- `apps/backend` (this repo) — the sibling app to mirror: workspace `package.json`, `wrangler.jsonc`, how it registers in root `workspaces`/`turbo.json`, Husky setup (`.husky/*`), ESLint/Prettier conventions (`eslint.config.mjs`), and `ENV`/`.dev.vars` config pattern.
- The `7-30` monorepo (`apps/backoffice`, `packages/*`, `turbo.json`, `.github/workflows/`) — the reference layout for a React app + shared pipeline.
- `swagger.yaml` — the API contract the client is generated from (production server `https://api.invernspirit.com`).
- [14 step-03](../14-api-contract-typed-client/step-03-typed-client-package.md) — the in-repo typed-client package this consumes.
