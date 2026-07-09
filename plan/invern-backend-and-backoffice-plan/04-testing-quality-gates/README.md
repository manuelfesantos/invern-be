# 04 — Testing & Quality Gates

**Status:** Done · **Priority:** P0 · **Track:** Backend Hardening

> **Done (SPIRIT-104):** all 3 steps complete — jest scaffolding + fakes (01), baseline suites on the riskiest paths (02: crypto/JWT/credentials/R2-lock/stock-guard/reserveLineItems-compensation/cart-ops/webhook-guards — **96 tests / 22 suites**), and the corrected CI gate running lint + typecheck (root + apps) + test (03).

## Summary
The repo has a `jest.config.ts` and CI that runs `npm test` — but there are **zero** `*.test.ts` files anywhere, and the test script is `jest --coverage --passWithNoTests`, so "tests pass" is vacuously true. Meanwhile the PR gate into `main` (production) checks only that the source branch is named `preview` and re-runs nothing. This feature stands up real test infrastructure, writes the first suites on the riskiest code, and makes both CI gates meaningful. It is deliberately sequenced **early and in parallel** with the P0 security/integrity work, because those features' acceptance criteria all require tests.

## Why this matters
Every other feature in this plan changes security- or money-critical code (auth, hashing, locking, stock, webhooks). Without a test harness, each of those changes ships on manual verification alone, and the CI gates provide false confidence — `main` can receive code that was never re-validated after the last `preview` run.

## Goals — what "done" looks like
- `npm test` runs real suites; `--passWithNoTests` is removed.
- A documented testing approach exists for this codebase's shapes: pure utils, use-cases with mocked DB actions, and route handlers with a synthetic Pages Functions context.
- The riskiest existing paths have baseline coverage: crypto/JWT, credential resolution, the R2 lock, stock reserve/release, and webhook parsing.
- PRs into `main` re-run lint + test + typecheck (not just a branch-name check).

## User / business impact
Internal only — engineers and the release process. Indirectly protects every user-facing behavior touched by the rest of the plan.

## In scope / Out of scope
**In scope:** Jest infrastructure (mocks/harness for ENV, contextStore, logger, KV/R2/D1 fakes), first suites on critical paths, CI gate fixes on `invern-be`.
**Out of scope:** feature-specific tests (each feature's steps own their tests); backoffice testing (features 15/24); full integration/E2E environments.

## Dependencies
**Depends on:** None — this is a Phase-0 starting point.
**Blocks:** Test-writing in features 01, 02, 03 (their acceptance criteria assume this harness exists).

## Steps
| # | Step | Priority | Status | Depends on |
|---|---|---|---|---|
| 01 | [Jest scaffolding: harness, fakes, first smoke tests](./step-01-jest-scaffolding-and-fakes.md) | P0 | Done | — |
| 02 | [Baseline suites for the riskiest existing paths](./step-02-critical-path-suites.md) | P0 | In Progress | step-01 |
| 03 | [Make the `main` CI gate real](./step-03-extend-main-ci-gate.md) | P0 | Done | step-01 |

## Key risks
- **Workers-runtime coupling.** Much code reads `ENV` via an AsyncLocalStorage-style store (`libs/utils/env`, `libs/utils/context`, `libs/utils/logger/logger-store.ts` throws if uninitialized). The harness must initialize these or most modules are untestable. Solve it once in step 01, not per-suite.
- **Over-investing in emulation.** Full `wrangler`-level integration tests are attractive but slow to build; the plan intentionally starts with unit/use-case tests plus thin fakes for KV/R2/D1. Don't block P0 features on a perfect harness.

## Relevant existing code
- `jest.config.ts` — ts-jest preset + tsconfig path mapping (already correct for imports).
- `package.json` — `"test": "jest --coverage --passWithNoTests"`.
- `.github/workflows/validate-pr-to-preview.yml` — lint/test/typecheck jobs (the pattern to reuse).
- `.github/workflows/validate-pr-to-main.yml` — branch-name-only check (uses `actions/checkout@v2`), the gap to fix.
- `libs/utils/logger/logger-store.ts` — `withLogger` (AsyncLocalStorage store the harness must enter).
- `libs/utils/env/index.ts`, `libs/utils/context/context-store.ts` — global stores to initialize in tests.
- `.husky/pre-commit` — currently runs `npm run lint` (candidate to also run related tests later).
