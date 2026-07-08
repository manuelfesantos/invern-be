---
status: Done
priority: P0
feature: 04-testing-quality-gates
track: backend-hardening
depends_on: []
blocks: ["04-testing-quality-gates/step-02", "04-testing-quality-gates/step-03", "01-admin-auth-rbac-cors/step-04", "02-credential-session-hardening/step-01", "03-payment-stock-integrity/step-01"]
---
# Step 01: Jest scaffolding: harness, fakes, first smoke tests

**Status:** Done · **Priority:** P0 · **Feature:** [Testing & Quality Gates](./README.md)

## Technical goal
Make the codebase practically testable: a shared test harness that initializes the global stores (`ENV`, logger, context), in-memory fakes for `KVNamespace` and `R2Bucket`, a mocking pattern for DB actions, and 2–3 smoke tests proving the harness works. Remove `--passWithNoTests`.

## User impact
None — internal infrastructure that every subsequent test depends on.

## Current state
- `jest.config.ts` exists (ts-jest, `pathsToModuleNameMapper` from `tsconfig.json` — path aliases like `@jwt-utils` will resolve in tests).
- Zero `*.test.ts` files exist anywhere (verified by file listing).
- `npm test` = `jest --coverage --passWithNoTests` → passes with no tests.
- Global-state constraints discovered in the audit:
  - `logger()` **throws** if `withLogger` hasn't entered the AsyncLocalStorage store (`libs/utils/logger/logger-store.ts`), and most use-cases call `logger()` — so nearly every test needs the logger store entered.
  - `ENV` is set via `setEnv(env)` (`libs/utils/env`) from the global middleware; tests must call it with a fake `Env`.
  - `contextStore` (`libs/utils/context/context-store.ts`) must be `.run(...)` for use-cases that read request context.
  - `crypto.subtle` is available in Node ≥ 20 (`globalThis.crypto`) — the CI already uses Node 20, so Web Crypto-based code (hashing, AES-GCM, JWT) is testable without polyfills; confirm locally.

## Technical steps
1. Create `test/` (or co-located `__tests__/`) with a `test/harness.ts` exporting `withTestContext(fn, { env?, context? })` that: builds a fake `Env` (all string vars stubbed; `AUTH_KV`/`VALIDATION_KV`/`STOCK_KV` as in-memory KV fakes; `STOCK_BUCKET` as an in-memory R2 fake; `INVERN_DB` left undefined unless a test provides a fake), calls `setEnv`, enters `withLogger` with a no-op/tracking logger, and enters `contextStore.run` with a provided context.
2. Implement `test/fakes/kv.ts` — a Map-backed `KVNamespace` (get/put/delete + `expirationTtl` recorded), and `test/fakes/r2.ts` — a Map-backed `R2Bucket` with **etag semantics** (`put` returns an object with a new etag; `onlyIf: { etagMatches }` honored; `get` returns `{ text(), json(), etag }`), since the lock tests (feature 03) depend on those semantics.
3. Establish the DB-mocking pattern: DB access goes through action factories (`libs/db/**/actions/*` via `actionBuilder`) that use-cases import; tests mock the specific action modules with `jest.mock(...)` returning `{ run: async () => ... }` shapes. Document this pattern in `test/README.md` with one worked example.
4. Write smoke tests proving the harness: (a) a pure util (e.g. `redactPropertiesFromData`), (b) a Web Crypto path (`hashString` round-trip), (c) one use-case with a mocked action (e.g. `getAllCollections`).
5. Remove `--passWithNoTests` from `package.json` and confirm `npm test` passes with the smoke tests; check coverage output doesn't fail CI (no thresholds configured yet — leave thresholds for later, don't add arbitrary numbers now).
6. Document module-mapping quirks: `@schema` etc. resolve via tsconfig paths; verify `jest` resolves them (the config already maps them — confirm with the smoke tests).

## Dependencies
**Depends on:** None.
**Blocks:** [step-02](./step-02-critical-path-suites.md), [step-03](./step-03-extend-main-ci-gate.md), and the test tasks inside features 01–03.

## Implementation notes
- **Keep fakes minimal but faithful where it matters.** The R2 fake's etag/conditional-put behavior is the one piece that must be semantically accurate (feature 03's lock tests hinge on it). KV fakes can be simple.
- Don't try to fake D1/Drizzle at the SQL level in this step. Use-case tests mock actions; if real-SQL tests are wanted later, evaluate `better-sqlite3` + drizzle as a follow-up (or a live local D1 via wrangler for integration tests) — a step for another day, note it in `test/README.md`.
- `Date.now()` appears in lock TTL logic — use `jest.useFakeTimers({ doNotFake: [...] })` or inject clock values where needed.
- Keep the harness dependency-free (no new prod deps); `jest`, `ts-jest`, `@types/jest` are already installed.

## Acceptance criteria
- [ ] `withTestContext` initializes ENV + logger + context so an arbitrary use-case can run in a test without throwing "logger store is not initialized".
- [ ] KV and R2 fakes exist; the R2 fake honors `onlyIf: { etagMatches }`.
- [ ] The three smoke tests pass; `npm test` runs them; `--passWithNoTests` is removed.
- [ ] `test/README.md` documents the harness and the action-mocking pattern with an example.
- [ ] CI (`validate-pr-to-preview.yml`) is green with the new tests.

## References
- `jest.config.ts`, `tsconfig.json` — existing test config + path aliases.
- `libs/utils/logger/logger-store.ts` — `withLogger` / thrown error when uninitialized.
- `libs/utils/env/index.ts` — `setEnv`/`ENV`.
- `libs/utils/context/context-store.ts` — `contextStore.run`.
- `libs/db/generics/actions/builder.ts` — `actionBuilder` (the shape tests will mock).
- `libs/entities/env/index.ts` — the `Env` interface the fake must satisfy.

## Verification (2026-07-03 · commit SPIRIT-104 on branch `spirit-plan-execution`)
Implemented and verified locally against `invern-be`:
- Added `test/harness.ts` (`withTestContext` — sets up the ENV proxy via `setEnv`, enters `withLogger` + `contextStore.run`, builds a full fake `Env` with every key so the proxy never throws, `INVERN_DB` a throwing proxy), `test/fakes/{kv,r2,logger}.ts`, `test/README.md`.
- Smoke tests: `test/smoke/redact.test.ts` (pure util), `test/smoke/hash.test.ts` (Web Crypto — `hashString` deterministic + `hashPassword` run **inside** `withTestContext`, proving ENV/logger/context init works), `test/smoke/get-all-collections.test.ts` (use-case with a `jest.mock("@collection-db", …)` action). Added `test/fakes/r2.test.ts` explicitly proving the R2 fake's `onlyIf: { etagMatches }` returns `null` on stale etag and an object on match (feature 03 depends on this).
- Removed `--passWithNoTests` from `package.json` (`"test": "jest --coverage"`).
- **Two config/hygiene fixes were necessary to get the three CI jobs green locally**, recorded as deviations:
  1. `jest.config.ts` imported `tsconfig.json` as an ESM JSON module, which fails on Node ≥22 (local is Node 24) with `ERR_IMPORT_ATTRIBUTE_MISSING`; changed it to read+parse via `fs`. Also added a `transform`/`transformIgnorePatterns` block so ESM-only deps (`@tsndr/cloudflare-worker-jwt`, `query-string` + its transitive ESM deps) are transpiled to CJS — jest had **never actually run** before (zero tests + `--passWithNoTests`), so this transform gap was latent. Kept CJS jest so the `jest.mock` hoisting pattern works.
  2. Fixed a **pre-existing lint break on `preview`**: `libs/modules/user/utils/validate-secret.ts` imported `deleteValidateEmailSecret` but never used it (left dead by commit `60c9708` "don't delete screet after validation"). `npm run lint` was already red on `preview`; removed the dead import. Root-cause fix, minimal diff.
- Ran, exit codes captured: `npm run lint` → 0, `npm run type-check` → 0, `npx jest` → 0 (4 suites, 10 tests passed). These are exactly the three jobs in `validate-pr-to-preview.yml`, replicated locally (GitHub Actions itself can't run on this machine).
