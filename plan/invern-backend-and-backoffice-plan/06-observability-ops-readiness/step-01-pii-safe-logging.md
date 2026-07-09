---
status: Done
priority: P1
feature: 06-observability-ops-readiness
track: backend-hardening
depends_on: []
blocks: []
---
# Step 01: Structural PII redaction in logging

**Status:** Done · **Priority:** P1 · **Feature:** [Observability & Operational Readiness](./README.md)

## Technical goal
Stop customer PII from reaching Honeycomb: expand and restructure redaction so it operates on structured data (not pre-stringified blobs), and rewrite the known PII-logging call sites to log identifiers instead of identities.

## User impact
Shoppers/admins: emails, names, addresses and payment details stop being copied into a third-party observability store. No visible behavior change.

## Current state
- The redaction list is exactly one key: `["accessToken"]` (`libs/utils/logger/redact-properties-from-data.ts`); `redactObject` walks objects/arrays and masks matching keys.
- `logger-store.ts` `info/warn/error` build a log JSON (`buildLogObject`) then `addRedactedLog` parses and key-redacts it. But call sites commonly pass **already-stringified** payloads inside `data` (e.g. `data: { checkoutSessionResult: stringifyObject(event) }`), and a string value has no keys — so nothing inside it is ever redacted.
- Verified PII call sites:
  - `get-order-from-session-result.ts`: logs `stringifyObject(personalDetails)` on missing-email warn (email/name/etc.), and the full created order (`stringifyObject(clientOrder)` — includes address + personal details).
  - `functions/stripe/session-result/index.ts`: logs the entire session event (`stringifyObject(event)` — customer details from Stripe).
  - `functions/stripe/payment-intent/index.ts`: `addRedactedData({ checkoutPaymentIntent: stringifyObject(event) })`.
  - `libs/modules/user/use-cases/oauth/google.ts`: logs the Google user object (email, names, picture) with only the id hashed.
- Header redaction at the Honeycomb plugin level is already reasonable (`redactRequestHeaders` in `functions/_middleware.ts` covers authorization/cookie/etc.).

## Technical steps
1. Define the redaction policy in one place: a key list covering at minimum `password`, `email`, `firstName`, `lastName`, `name`, `phone`, `address` (+ nested address fields), `personalDetails`, `customerEmail`, `trackingUrl`? (no — not PII), plus the existing `accessToken` and `refreshToken`. Export it from the redaction module with a comment explaining additions.
2. Change the logging convention: **never log pre-stringified payloads.** Pass structured objects into `data` so `redactPropertiesFromData` can walk them; move any `stringifyObject(...)` to *after* redaction (inside the logger), not before. Enforce with a lint rule if cheap (restrict `stringifyObject` import in modules?) or by convention + review checklist.
3. Rewrite the four verified call sites to log minimal identifiers: order id, session id, payment id, user id (already the `logCredentials` pattern), event `type` — not whole events/objects. Where a full payload is genuinely needed for debugging, log it only at `debug` level and still post-redaction.
4. Sweep the codebase for other `stringifyObject` uses inside `logger().` calls (grep) and triage each: keep (non-PII), restructure (make structured), or reduce (ids only).
5. Update the characterization tests from [04 step-02](../04-testing-quality-gates/step-02-critical-path-suites.md) for `redactPropertiesFromData` to cover the new list and nested-object behavior; add a test that a structured `personalDetails` object comes out fully masked.
6. Verify in preview: trigger a checkout flow and inspect the Honeycomb events for residual PII.

## Dependencies
**Depends on:** None (test updates assume [04 step-01](../04-testing-quality-gates/step-01-jest-scaffolding-and-fakes.md) landed).
**Blocks:** None.

## Implementation notes
- **Key-list redaction has limits** — a value like a free-text field containing an email won't be caught. The policy above is proportionate for this codebase; don't over-engineer pattern-matching redaction now.
- Careful with `logCredentials` (`log-credentials.ts`): it logs `cart.id`/`user.id` — ids are fine and useful for tracing; keep them.
- Redacting `email` everywhere may hide operationally-useful info (e.g. Brevo send logging `to`). Decide per-site: the send-email log (`libs/adapters/sendgrid/send-email.ts` logs `{ to }`) should log a masked form (e.g. `m***@gmail.com`) or just drop it — pick one and note it.
- Honeycomb retention: existing events already contain PII. If retention allows, consider deleting/expiring old datasets after the fix lands — note as a manual ops action in the runbook ([step-04](./step-04-ops-runbook.md)).

## Acceptance criteria
- [ ] Redaction list covers the PII keys above; nested objects are masked (test-proven).
- [ ] No call site passes pre-stringified payloads into log `data` (grep-verified).
- [ ] The four named call sites log identifiers only (or debug-level redacted structures).
- [ ] A preview-environment checkout produces Honeycomb events with zero visible PII.
- [ ] Tests updated/added for the new redaction behavior.

## References
- `libs/utils/logger/redact-properties-from-data.ts`, `logger-store.ts`, `build-log-object.ts` — the redaction pipeline.
- `libs/modules/order/use-cases/get-order-from-session-result.ts` — personalDetails/order logging.
- `functions/stripe/session-result/index.ts`, `functions/stripe/payment-intent/index.ts` — full-event logging.
- `libs/modules/user/use-cases/oauth/google.ts` — Google profile logging.
- `libs/adapters/sendgrid/send-email.ts` — `to` address logging.
- `functions/_middleware.ts` — header-level redaction (already OK).
