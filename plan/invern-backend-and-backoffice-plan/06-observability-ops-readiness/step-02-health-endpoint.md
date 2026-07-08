---
status: Not Started
priority: P1
feature: 06-observability-ops-readiness
track: backend-hardening
depends_on: []
blocks: ["06-observability-ops-readiness/step-03"]
---
# Step 02: Health endpoint + uptime monitoring

**Status:** Not Started · **Priority:** P1 · **Feature:** [Observability & Operational Readiness](./README.md)

## Technical goal
Add a lightweight, unauthenticated `/health` (and optionally `/ready`) endpoint that reports service liveness and key dependency reachability, and wire it to external uptime monitoring.

## User impact
None directly; enables faster outage detection so shopper-facing downtime is caught by monitoring, not by customers.

## Current state
- No health/status endpoint exists (route inventory in `swagger.yaml` shows none). The nearest thing is that `OPTIONS`/`HEAD` return 405 outside local (`functions/_middleware.ts`), so a naive uptime check against `/` would get an unhelpful result.
- Dependencies that matter for readiness: D1 (`INVERN_DB`), KV namespaces, R2 (`STOCK_BUCKET`), and external APIs (Stripe, Brevo) — though external APIs should be *checked shallowly* to avoid coupling health to third-party uptime.

## Technical steps
1. Add `functions/health/index.ts` (public, outside `/private`, so no admin auth) exporting `onRequestGet` that returns `200` with a small JSON: `{ status: "ok", env: ENV.ENV, time, checks: {...} }`.
2. Liveness vs readiness: keep `/health` a cheap liveness ping (process up, env loaded). Optionally add `/ready` that does *shallow* dependency checks — a trivial D1 `SELECT 1`, a KV get of a known key, an R2 head — with a short timeout each, reporting per-dependency status but still returning quickly.
3. Do **not** call Stripe/Brevo synchronously in the health check (don't tie your uptime to theirs). If external checks are wanted, make them a separate, clearly-labeled, cached/asynchronous signal.
4. Ensure the global middleware doesn't block it: the `OPTIONS`/`HEAD` 405 logic and Honeycomb wrapping should still allow a `GET /health`. Confirm `/health` isn't accidentally caught by any `/private` gate (it won't be — different prefix).
5. Keep it low-cardinality in logs (health pings shouldn't flood Honeycomb — consider not tracing them, or sampling).
6. Register external uptime monitoring (Cloudflare Health Checks, UptimeRobot, or similar) against `/health` for preview and production; document the monitor + alert target in the runbook ([step-04](./step-04-ops-runbook.md)).
7. Add the endpoint to `swagger.yaml` (coordinate with [14](../14-api-contract-typed-client/README.md)).

## Dependencies
**Depends on:** None.
**Blocks:** [step-03](./step-03-honeycomb-coverage-alerting.md) (alerting references the health signal).

## Implementation notes
- **Health checks must be cheap and not self-DoS.** A readiness check hammering D1 on every ping adds load; keep `/ready` checks trivial and consider caching the result for a few seconds.
- Return `200` for healthy, `503` for not-ready (so monitors interpret correctly) — but only `/ready` should ever return `503`; `/health` liveness returning `200` as long as the isolate runs is fine.
- Avoid leaking internals: the health payload should not expose secrets, versions of dependencies, or detailed error strings to the public.
- Cloudflare Workers/Pages don't "restart" like a server; liveness mostly proves routing + env are wired. Readiness (dependency reachability) is the more useful signal here.

## Acceptance criteria
- [ ] `GET /health` returns `200` quickly with a minimal status payload, unauthenticated, in all environments.
- [ ] Optional `/ready` performs shallow D1/KV/R2 checks and returns `503` when a dependency is unreachable.
- [ ] Health checks do not call Stripe/Brevo synchronously.
- [ ] External uptime monitoring is configured against `/health` (preview + prod) and documented.
- [ ] Endpoint added to `swagger.yaml`; health pings don't flood Honeycomb.

## References
- `functions/_middleware.ts` — `OPTIONS`/`HEAD` handling + Honeycomb wrap the new route must coexist with.
- `libs/entities/env/index.ts` — bindings to (shallowly) check.
- `libs/db/d1-db-client.ts` — D1 handle for a `SELECT 1`.
- `swagger.yaml` — add the endpoint.
- [step-04](./step-04-ops-runbook.md) — runbook to document the monitor.
