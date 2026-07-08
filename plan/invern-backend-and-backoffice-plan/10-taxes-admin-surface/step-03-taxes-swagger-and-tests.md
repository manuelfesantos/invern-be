---
status: Not Started
priority: P1
feature: 10-taxes-admin-surface
track: backend-api-completion
depends_on: ["10-taxes-admin-surface/step-02"]
blocks: []
---
# Step 03: Taxes swagger + tests

**Status:** Not Started · **Priority:** P1 · **Feature:** [Taxes Admin Surface](./README.md)

## Technical goal
Document `/private/taxes` in `swagger.yaml` and add tests covering CRUD, rate validation/representation, country linkage, and the pricing-math neutrality of the rate-storage fix.

## User impact
None directly; keeps the typed client accurate and guards the tax surface + pricing math from regression.

## Current state
- No tax paths in `swagger.yaml`; no tax tests.
- The rate-storage fix (step-01) touches money math and must be regression-covered.

## Technical steps
1. Swagger: add `/private/taxes` paths + tax schema (with the corrected rate representation) + envelope on the list + admin security.
2. Tests (per [04](../04-testing-quality-gates/README.md)):
   - CRUD happy paths (create for a country, list filtered by country, update, delete).
   - Rate validation (out-of-range/negative rejected); representation round-trips as the documented unit.
   - Country linkage (invalid `countryCode` → 400).
   - **Pricing neutrality:** a test asserting the extender computes the same taxed price for a known input before and after the storage change (pin the money math).
   - Auth: one anonymous/USER rejection.
3. Confirm spec-freshness CI passes.

## Dependencies
**Depends on:** [step-02](./step-02-taxes-routes.md).
**Blocks:** None. Feeds [14](../14-api-contract-typed-client/README.md).

## Implementation notes
- The most important test here is the **pricing-neutrality** one — it's the guardrail proving the rate-storage fix didn't shift live prices. Base it on a concrete example (e.g. a €100 net product at 23% → €123 gross) computed through the real extender.
- If step-01 chose Stripe mirroring, add a test (with a mocked Stripe adapter) that create/update calls the mirror; if D1-authoritative, assert it does **not** call Stripe.

## Acceptance criteria
- [ ] `/private/taxes` fully documented in `swagger.yaml` with the corrected rate representation.
- [ ] Tests cover CRUD, rate validation/representation, country linkage, and pricing neutrality.
- [ ] Stripe-mirroring behavior matches the step-01 decision (tested).
- [ ] Spec-freshness CI passes.

## References
- `swagger.yaml` — add tax paths.
- `libs/utils/extender/utils/*` — pricing math for the neutrality test.
- [04](../04-testing-quality-gates/README.md) — Jest harness.
- [14](../14-api-contract-typed-client/README.md) — spec/client sync.
