---
status: Done
priority: P0
feature: 04-testing-quality-gates
track: backend-hardening
depends_on: ["04-testing-quality-gates/step-01"]
blocks: []
---
# Step 03: Make the `main` CI gate real

**Status:** Done · **Priority:** P0 · **Feature:** [Testing & Quality Gates](./README.md)

## Technical goal
Make PRs into `main` (production) re-run the full quality gate — lint, test, typecheck — instead of only validating the source branch name, and modernize the workflow's actions.

## User impact
Internal/release safety: code cannot reach production without passing the same checks required for staging.

## Current state
- `.github/workflows/validate-pr-to-main.yml`: single job that checks `github.event.pull_request.head.ref == "preview"`, closes the PR via `gh pr close` otherwise, and then runs a placeholder echo step ("Your workflow steps here"). It uses `actions/checkout@v2` (deprecated) and `permissions: write-all` (over-broad).
- `.github/workflows/validate-pr-to-preview.yml`: proper 4-job pipeline (setup + lint + test + typecheck) on Node 20 with npm caching. Note a quirk: the `setup` job runs `npm install` while later jobs run `npm ci` — each job re-installs anyway (jobs don't share workspaces), so `setup` is redundant.
- Branch hygiene also exists client-side: `.husky/commit-msg`/`pre-push` block direct commits/pushes to `main`/`preview`, and `.husky/pre-commit` runs `npm run lint`.

## Technical steps
1. Rewrite `validate-pr-to-main.yml` to: (a) keep the source-branch==`preview` check (it encodes the promotion flow), and (b) add lint/test/typecheck jobs mirroring the preview workflow (same Node 20 + `npm ci` pattern).
2. Modernize: `actions/checkout@v4`, `actions/setup-node@v4`, and narrow `permissions` to what the branch-check step needs (`pull-requests: write` for the close action, or drop auto-close in favor of just failing the check — recommended: **fail, don't auto-close**; auto-closing PRs is hostile to the workflow and the current `gh pr close` invocation passes a branch name where a PR number is expected, which is itself buggy).
3. Clean the preview workflow's redundant `setup` job (optional, same PR): either remove it or make the jobs depend purely on cache priming; keep behavior identical otherwise.
4. Enable branch protection expectations in the repo settings (documented in the PR/runbook — GitHub settings aren't code): require the new checks to pass on `main` and `preview`.
5. Verify with a dummy PR in each direction (preview→main from a test branch state) that gates run and report.

## Dependencies
**Depends on:** [step-01](./step-01-jest-scaffolding-and-fakes.md) (tests must exist/run for the test job to be meaningful — with `--passWithNoTests` removed, an empty suite would fail).
**Blocks:** None.

## Implementation notes
- Sequencing matters: land step-01 (which removes `--passWithNoTests`) before or with this change, otherwise the `main` test job would fail on "no tests found".
- The `gh pr close ${{ github.event.pull_request.head.ref }}` call in the current workflow passes `preview` (a branch name) as the argument; `gh pr close` expects a number/URL/branch — it may work by accident with a branch, but the recommended change (fail instead of close) sidesteps the question.
- Keep workflow duplication low: consider a single reusable workflow (`workflow_call`) used by both PR targets, so gates can't drift apart again.
- Coverage thresholds: only introduce once step-02's suites give a real baseline; a threshold added now would be arbitrary.

## Acceptance criteria
- [ ] A PR into `main` runs lint, test, and typecheck, and fails if any fail.
- [ ] The source-branch rule (only `preview` → `main`) still enforced (as a failing check, not an auto-close).
- [ ] Actions upgraded (`checkout@v4`, `setup-node@v4`); `permissions` narrowed.
- [ ] Both workflows share the same gate definitions (or are verifiably identical).
- [ ] Documented note (runbook / repo docs) that branch protection requires these checks.

## References
- `.github/workflows/validate-pr-to-main.yml` — the gap.
- `.github/workflows/validate-pr-to-preview.yml` — the pattern to mirror (and its redundant `setup` job).
- `.husky/pre-commit`, `.husky/commit-msg`, `.husky/pre-push` — existing local gates.
- `package.json` — `lint` / `test` / `type-check` scripts the jobs call.

## Verification (2026-07-03 · commit `SPIRIT-104` / `25fa521`)
- Chose the **reusable-workflow** option (plan's suggestion) so the gates can't drift: new `.github/workflows/quality-gate.yml` (`on: workflow_call`, Node 20 `npm ci`, lint/test/type-check). Both PR workflows now `uses: ./.github/workflows/quality-gate.yml`.
- `validate-pr-to-main.yml`: keeps the promotion rule (source must be `preview`) but **fails** instead of `gh pr close`-ing (which also passed a branch name where a number/URL is expected); `quality-gate` runs via `needs: validate-source-branch`; `permissions` narrowed to `contents: read` (was `write-all`); `checkout@v4`/`setup-node@v4`.
- `validate-pr-to-preview.yml`: reduced to a call of the reusable gate; removed the redundant `setup` job that re-`npm install`ed without sharing a workspace.
- **Verification limit:** GitHub Actions can't run on this machine. Verified: all 3 files are valid YAML; the gate commands are exactly `npm run lint` / `type-check` / `test`, all of which pass locally on this branch (proven repeatedly this session). `actionlint` was not installed. A real Actions run happens when the maintainer opens a PR.
- **Branch protection** (requiring these checks on `main`/`preview`) is a GitHub repo-settings action for the maintainer — noted here and tracked in feature 06's runbook.
