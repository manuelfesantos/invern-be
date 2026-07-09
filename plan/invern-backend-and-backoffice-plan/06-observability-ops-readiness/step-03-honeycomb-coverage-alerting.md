---
status: Done
priority: P1
feature: 06-observability-ops-readiness
track: backend-hardening
depends_on: ["06-observability-ops-readiness/step-02"]
blocks: []
---
# Step 03: Honeycomb coverage verification & alerting

**Status:** Done · **Priority:** P1 · **Feature:** [Observability & Operational Readiness](./README.md)

## Technical goal
Confirm every route is actually traced through Honeycomb, add consistent error/latency instrumentation where gaps exist, and configure alerting on the signals that matter (5xx rate, webhook failures, health-check failures).

## User impact
None directly; faster and more reliable detection of failures affecting shoppers and admins.

## Current state
- Honeycomb is initialized in the global middleware via `@cloudflare/pages-plugin-honeycomb` (`functions/_middleware.ts`), which wraps requests and provides the tracer used by `logger()`. So all routes *under* the middleware are traced by default.
- The logger has `info/debug/warn/error` levels gated by `LOGGER_LEVEL` (`logger-store.ts`), and `addRedactedData` attaches structured fields.
- No evidence of configured Honeycomb **triggers/alerts** (that's dashboard config, not in the repo). Webhook handlers log extensively but there's no alert on webhook 4xx/5xx.
- After [step-02](./step-02-health-endpoint.md), a health signal exists to alert on.

## Technical steps
1. Verify coverage: enumerate routes from `swagger.yaml` and confirm each emits a Honeycomb trace (spot-check in the dashboard across public, private, and webhook routes). Note any route that bypasses the middleware (there shouldn't be — everything is under `functions/`).
2. Standardize error instrumentation: ensure the shared error path (`generateErrorResponse` / `requestHandler`'s try-catch in `libs/utils/decorator/index.ts`) emits an error-level trace with status + useCase + safe context for every 4xx/5xx. Confirm thrown `errors.*` produce a traced event, not a silent response.
3. Add distinguishing fields for alertable conditions: mark webhook failures, auth failures (401/403 from the new `/private` middleware), and stock-lock-exhaustion (from [03](../03-payment-stock-integrity/README.md)) with stable attributes so alerts can target them.
4. Configure Honeycomb triggers (dashboard; document in runbook): elevated 5xx rate, webhook handler failures, `/ready` failures / uptime-monitor down, and (optionally) p99 latency. Define who/where alerts go (email/Slack/PagerDuty — per the team's setup).
5. Confirm sampling/volume is sane — health pings excluded or sampled (from step-02), high-cardinality PII fields gone (from [step-01](./step-01-pii-safe-logging.md)).
6. Record the alert definitions + thresholds in the runbook ([step-04](./step-04-ops-runbook.md)) so they're reproducible if the Honeycomb config is lost.

## Dependencies
**Depends on:** [step-02](./step-02-health-endpoint.md) (health signal to alert on). Benefits from [step-01](./step-01-pii-safe-logging.md) (clean fields) and [03](../03-payment-stock-integrity/README.md) (lock-exhaustion signal).
**Blocks:** None.

## Implementation notes
- Most of the *coverage* likely already exists via the plugin — the real work is (a) confirming it, (b) making error traces consistent, and (c) the dashboard alerting, which lives outside the repo. Capture the alert config as code-adjacent documentation so it's not tribal knowledge.
- Don't add heavy per-request custom spans that inflate Honeycomb cost; add fields, not spans, for alertability.
- Thresholds should start loose to avoid alert fatigue, then tighten with real baseline data.

## Acceptance criteria
- [ ] Every route in `swagger.yaml` is confirmed traced (spot-checked, gaps fixed).
- [ ] 4xx/5xx responses consistently emit error-level traces with status + useCase + safe context.
- [ ] Webhook failures, auth failures, and stock-lock exhaustion carry stable, alertable attributes.
- [ ] Honeycomb triggers configured for 5xx rate, webhook failures, and health/uptime failure; recipients defined.
- [ ] Alert definitions + thresholds documented in the runbook.

## References
- `functions/_middleware.ts` — Honeycomb plugin init.
- `libs/utils/logger/logger-store.ts` — log levels + structured data.
- `libs/utils/decorator/index.ts` — `requestHandler`/`middlewareRequestHandler` try-catch (error path).
- `libs/entities/response/error-response.ts`, `libs/utils/error-handling/**` — error responses to trace.
- `swagger.yaml` — route inventory to verify against.
