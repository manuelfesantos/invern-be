# 06 — Observability & Operational Readiness

**Status:** Done · **Priority:** P1 · **Track:** Backend Hardening

## Summary
Logging goes to Honeycomb via the Pages plugin, but the redaction layer only masks a single property name (`accessToken`) and several call sites log full customer PII (personal details, whole Stripe events, Google profile objects) — often pre-stringified, which bypasses key-based redaction entirely. There is no health endpoint, no documented deploy/rollback procedure, and the three `/private/expired/*` maintenance routes have no documented scheduler. This feature makes logs safe, the service observable, and operations repeatable.

## Why this matters
PII in logs is a compliance and breach-amplification problem — a Honeycomb account compromise shouldn't leak customer emails and addresses. No health endpoint means outages are discovered by users. Undocumented ops (who calls the expired-session cleaner? how do you roll back a bad deploy?) turn routine incidents into archaeology, which is exactly wrong for a solo-maintained pre-launch system.

> **Added finding (2026-07-03, discovered during feature 01 step-02):** client-facing error bodies leak a `stack` field. `errorResponse.FORBIDDEN()`/`NOT_FOUND()`/etc. called without an explicit error, and `generateErrorResponse`'s `simplifyError`, serialize `{ name, cause, stack, message }` into the HTTP response — so 401/403/500 bodies expose server file paths (verified: a USER hitting `/private/products` gets a body containing a `.wrangler/tmp/.../functionsWorker` stack). Fix: strip `stack` (and `cause`/internal fields) from client error bodies, keeping them in logs only; standardize on the `{ issues: [...] }` shape already used elsewhere. Low-risk but touches the shared error-response builder, so it needs its own change + a check that the storefront/backoffice error parsing still works. Fold into this feature (a new step or extend step-01's redaction scope to cover responses, not just logs).

## Goals — what "done" looks like
- No customer PII (emails, names, addresses, full payment payloads) reaches Honeycomb; redaction is structural, not best-effort.
- A `/health` endpoint reports dependency status and is monitored.
- Honeycomb coverage and alerting are verified (all routes traced, 5xx alerting configured or consciously deferred).
- A written runbook covers deploy, rollback, scheduled maintenance (expired sessions/carts/users), stock resync, and admin bootstrap.

## User / business impact
Shoppers: their personal data stops flowing into a third-party log store. On-call/engineers: faster detection and safer recovery. Admin staff: indirectly — a documented admin-bootstrap process is what gets the first `ADMIN` account created for the backoffice.

## In scope / Out of scope
**In scope:** log/PII redaction, health endpoint, Honeycomb verification + alerting, ops runbook (including scheduling the expired-* routes).
**Out of scope:** an admin-action audit log (deferred — see root README); dashboards/analytics for business metrics; backoffice-side observability (feature 24).

## Dependencies
**Depends on:** [01](../01-admin-auth-rbac-cors/README.md) step-02 decides how `/private/expired/*` are authenticated — the runbook documents the outcome.
**Blocks:** None (launch-adjacent rather than launch-blocking, except the PII step which should land pre-launch).

## Steps
| # | Step | Priority | Status | Depends on |
|---|---|---|---|---|
| 01 | [Structural PII redaction in logging](./step-01-pii-safe-logging.md) | P1 | Done | — |
| 02 | [Health endpoint + uptime monitoring](./step-02-health-endpoint.md) | P1 | Done | — |
| 03 | [Honeycomb coverage verification & alerting](./step-03-honeycomb-coverage-alerting.md) | P1 | Done | step-02 |
| 04 | [Operations runbook (deploy, rollback, scheduled maintenance, recovery)](./step-04-ops-runbook.md) | P1 | Done | 01-admin-auth-rbac-cors/step-02 |

## Key risks
- **Redaction that only works for object keys.** Much logging stringifies payloads *before* logging (`stringifyObject(...)`), so a key-based redactor never sees inside. The fix must change what is logged (structured, minimal fields), not just extend a key list.
- **Over-logging is also under-observability.** Deleting log calls wholesale would hurt debuggability; each PII call site should be replaced with a minimal-safe equivalent (ids, not identities).

## Relevant existing code
- `libs/utils/logger/redact-properties-from-data.ts` — redaction list is `["accessToken"]` only.
- `libs/utils/logger/logger-store.ts` — `addRedactedData`, `addRedactedLog` (parses the built log JSON, then key-redacts — pre-stringified strings inside `data` pass through opaque).
- PII call sites verified: `libs/modules/order/use-cases/get-order-from-session-result.ts` (logs `personalDetails` on warn; full created-order), `functions/stripe/session-result/index.ts` + `payment-intent/index.ts` (log entire Stripe events), `libs/modules/user/use-cases/oauth/google.ts` (logs the Google user object incl. email/name).
- `functions/_middleware.ts` — Honeycomb plugin config (`redactRequestHeaders` list is decent for headers).
- `functions/private/expired/{carts,sessions,users}/index.ts` — ungated maintenance routes with no documented caller.
- `functions/private/stock/setup/index.ts` — the stock resync escape hatch the runbook must document.
- `scripts/start.js` — `wrangler pages dev` (local run path).
