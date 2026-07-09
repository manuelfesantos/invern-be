---
status: Done
priority: P0
feature: 11-order-fulfillment-endpoints
track: backend-api-completion
depends_on: ["11-order-fulfillment-endpoints/step-01", "11-order-fulfillment-endpoints/step-02"]
blocks: []
---
# Step 03: Order/fulfillment swagger + tests

**Status:** Done · **Priority:** P0 · **Feature:** [Order & Fulfillment Endpoint Improvements](./README.md)

## Technical goal
Update `swagger.yaml` for the corrected order-update semantics and the new fulfillment endpoint, and add tests covering the mutable-field whitelist, the fulfillment state machine, and tracking-URL validation.

## User impact
None directly; accurate contract for the typed client and regression protection for order/fulfillment logic.

## Current state
- `swagger.yaml` documents `PUT /private/orders/{id}` and `/cancel` but with the old (misleading) semantics and no fulfillment endpoint.
- No tests for order update, cancel, or fulfillment.

## Technical steps
1. Swagger: correct the `PUT /private/orders/{id}` request schema to the constrained mutable-field set and fix its response description; add the fulfillment endpoint (from [step-02](./step-02-fulfillment-status-endpoint.md)) with its status enum + trackingUrl; keep `/cancel` documented.
2. Tests (per [04](../04-testing-quality-gates/README.md)):
   - Order update: allowed field changes succeed with an accurate message; disallowed fields (`stripeId`/`paymentId`/`products`) are rejected/ignored.
   - Cancel: sets `isCanceled` only; message correct.
   - Fulfillment: valid transitions succeed; illegal transitions rejected; `trackingUrl` validation (accept `https`, reject non-URL / non-https); order-cancel↔transaction-cancel behavior per step-02's decision.
   - Auth: one anonymous/USER rejection.
3. Confirm spec-freshness CI passes.

## Dependencies
**Depends on:** [step-01](./step-01-fix-order-update-semantics.md), [step-02](./step-02-fulfillment-status-endpoint.md).
**Blocks:** None. Feeds [14](../14-api-contract-typed-client/README.md).

## Implementation notes
- The fulfillment **state-machine test** and the **mutable-field-whitelist test** are the two that matter most — they encode the two safety properties this feature adds. Make them explicit and thorough.
- Reuse the order fixtures from the webhook idempotency tests ([03 step-03](../03-payment-stock-integrity/step-03-webhook-idempotency.md)) if helpful to avoid duplicating order setup.

## Acceptance criteria
- [ ] `swagger.yaml` reflects the constrained order update, the fulfillment endpoint, and cancel.
- [ ] Tests cover the mutable-field whitelist, the fulfillment state machine, tracking-URL validation, and cancel.
- [ ] One auth-rejection test included.
- [ ] Spec-freshness CI passes.

## References
- `swagger.yaml` — order + fulfillment paths.
- [step-01](./step-01-fix-order-update-semantics.md), [step-02](./step-02-fulfillment-status-endpoint.md) — behavior under test.
- [04](../04-testing-quality-gates/README.md) — Jest harness.
- [14](../14-api-contract-typed-client/README.md) — spec/client sync.
