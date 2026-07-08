---
status: Not Started
priority: P0
feature: 08-shipping-admin-endpoints
track: backend-api-completion
depends_on: ["08-shipping-admin-endpoints/step-03"]
blocks: []
---
# Step 04: Shipping admin swagger + tests

**Status:** Not Started · **Priority:** P0 · **Feature:** [Shipping Admin Endpoints](./README.md)

## Technical goal
Document the entire new `/private/shipping/*` surface in `swagger.yaml` and add tests covering method CRUD, rate CRUD (incl. band validation), and rate-to-country assignment.

## User impact
None directly; the swagger accuracy feeds the backoffice's typed client ([14](../14-api-contract-typed-client/README.md)) and the tests protect this new surface from regression.

## Current state
- `swagger.yaml` has no shipping admin paths (the route inventory jumps from `/private/products` etc. to no shipping — verified).
- No tests exist for shipping admin (the routes are new).

## Technical steps
1. Add swagger paths/components for methods, rates, and rate-country assignment, including the pagination envelope on lists and the admin security scheme (from [01 step-04](../01-admin-auth-rbac-cors/step-04-admin-auth-tests-and-swagger.md)/[14](../14-api-contract-typed-client/README.md)). If swagger is generated from Zod, register the new schemas with the generator instead of hand-editing.
2. Tests (Jest, per [04](../04-testing-quality-gates/README.md)):
   - Method: create → list (paginated envelope) → detail (with rates) → update → delete (incl. the delete-with-rates rule).
   - Rate: create with valid band; reject `min>max` / negative / bad method; overlap rejection; update; delete.
   - Assignment: set country set (replace semantics); reject invalid country code; detail reflects `countryCodes`.
   - Auth: anonymous/USER rejected (relies on the [01](../01-admin-auth-rbac-cors/README.md) middleware — one representative test).
3. Confirm the spec-freshness CI check ([14 step-02](../14-api-contract-typed-client/step-02-openapi-generation-and-ci-check.md)) passes with the additions.

## Dependencies
**Depends on:** [step-03](./step-03-rate-country-assignment.md) (all endpoints exist).
**Blocks:** None. Feeds [14](../14-api-contract-typed-client/README.md).

## Implementation notes
- Prefer use-case-level tests (validation logic — band overlap, country validation) plus one route-level happy-path per resource; don't duplicate the full matrix at both levels.
- Keep swagger examples realistic (weight bands in grams, delivery times in business days per the schema comment) so the generated client and the UI have sensible shapes.

## Acceptance criteria
- [ ] Every `/private/shipping/*` endpoint is in `swagger.yaml` with request/response schemas, pagination, and the admin security scheme.
- [ ] Tests cover method CRUD, rate CRUD + band/overlap validation, and country assignment, plus one auth-rejection case.
- [ ] Spec-freshness CI check passes.

## References
- `swagger.yaml` — where the shipping paths go.
- [01 step-04](../01-admin-auth-rbac-cors/step-04-admin-auth-tests-and-swagger.md) — admin security scheme.
- [14](../14-api-contract-typed-client/README.md) — contract/client sync + spec-freshness CI.
- [04](../04-testing-quality-gates/README.md) — Jest harness.
