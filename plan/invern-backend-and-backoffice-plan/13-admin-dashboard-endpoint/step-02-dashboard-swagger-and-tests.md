---
status: Done
priority: P1
feature: 13-admin-dashboard-endpoint
track: backend-api-completion
depends_on: ["13-admin-dashboard-endpoint/step-01"]
blocks: []
---
# Step 02: Dashboard swagger + tests

**Status:** Done · **Priority:** P1 · **Feature:** [Admin Dashboard / Summary Endpoint](./README.md)

## Technical goal
Document the summary endpoint in `swagger.yaml` and add tests verifying the payload shape, the low-stock threshold behavior, and that aggregates are correct against seeded data.

## User impact
None directly; contract accuracy for the typed client and regression protection for the summary.

## Current state
- No dashboard path in `swagger.yaml`; no tests (endpoint is new).

## Technical steps
1. Swagger: add `GET /private/dashboard` with the summary schema (counts, lowStock[], recentOrders[]) and admin security.
2. Tests (per [04](../04-testing-quality-gates/README.md)) with mocked/seeded actions:
   - Counts match the seeded number of orders/products/users.
   - `lowStock` includes products at/under the threshold and excludes those above; respects the limit.
   - `recentOrders` returns the most recent N in descending order.
   - Auth: anonymous/USER rejected.
3. Confirm spec-freshness CI passes.

## Dependencies
**Depends on:** [step-01](./step-01-summary-endpoint.md).
**Blocks:** None. Feeds [14](../14-api-contract-typed-client/README.md).

## Implementation notes
- Test the low-stock **boundary** explicitly (a product exactly at the threshold) so the `<=` vs `<` semantics are pinned and match the list filter.
- If caching was added in step-01, add a test that stale-vs-fresh behavior is acceptable (or that TTL is short); otherwise skip.

## Acceptance criteria
- [ ] `GET /private/dashboard` documented in `swagger.yaml`.
- [ ] Tests cover counts, low-stock (incl. boundary), recent-orders ordering, and auth rejection.
- [ ] Spec-freshness CI passes.

## References
- `swagger.yaml` — dashboard path.
- [step-01](./step-01-summary-endpoint.md) — behavior under test.
- [04](../04-testing-quality-gates/README.md) — Jest harness.
