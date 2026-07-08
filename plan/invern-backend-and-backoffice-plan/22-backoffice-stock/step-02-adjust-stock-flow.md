---
status: Not Started
priority: P1
feature: 22-backoffice-stock
track: backoffice-app
depends_on: ["22-backoffice-stock/step-01", "03-payment-stock-integrity/step-02"]
blocks: []
---
# Step 02: Safe adjust-stock flow

**Status:** Not Started · **Priority:** P1 · **Feature:** [Stock Management UI](./README.md)

## Technical goal
Build the adjust-stock UI that sets or adjusts a product's stock exclusively through the unified tri-store write path/endpoint from [03 step-02](../03-payment-stock-integrity/step-02-tri-store-stock-consistency.md) — never the product update — with confirmation and consistency handling.

## User impact
Admin staff correct inventory safely; the number they set becomes the real, synced stock everywhere.

## Current state
- The safe write path/endpoint exists after [03 step-02](../03-payment-stock-integrity/step-02-tri-store-stock-consistency.md) (D1 + KV + R2 written together, with the fixed lock). The product update no longer accepts stock.

## Technical steps
1. Adjust control on the stock screen / product context: a form to **set absolute stock** or **apply a delta** (+/-). Recommend supporting both, with set-absolute as the primary (least error-prone for corrections).
2. Submit through the unified stock endpoint/mutation from [03 step-02](../03-payment-stock-integrity/step-02-tri-store-stock-consistency.md) — **explicitly not** `PUT /private/products/{id}` (which no longer accepts stock). Confirm the exact endpoint shape with [03](../03-payment-stock-integrity/README.md) (it may be a dedicated `/private/stock/*` write or a stock module operation exposed as a route).
3. Confirmation: for large decreases or setting to zero (making a product unsellable), confirm the intent.
4. Consistency handling: re-read current stock before showing the form (stock may have changed due to checkout reservations); on submit, handle a concurrent-change response gracefully (show the new current value, let the user re-decide) — don't blindly overwrite based on a stale read if the endpoint supports optimistic checks.
5. Feedback: success toast with the new value; invalidate the stock/product queries so the overview and product list reflect it.
6. Guardrails: reject negative absolute stock; a delta that would go negative is rejected server-side ([03 step-02](../03-payment-stock-integrity/step-02-tri-store-stock-consistency.md)'s guard) — surface that clearly.

## Dependencies
**Depends on:** [step-01](./step-01-stock-overview.md), [03 step-02](../03-payment-stock-integrity/step-02-tri-store-stock-consistency.md).
**Blocks:** None.

## Implementation notes
- **This flow must use the sanctioned stock path.** The entire point of [03](../03-payment-stock-integrity/README.md) is that stock writes go through one place that syncs D1/KV/R2; if this UI calls the product update (or any other path), it recreates the desync. Wire it to the exact endpoint [03 step-02](../03-payment-stock-integrity/step-02-tri-store-stock-consistency.md) exposes and nothing else.
- Prefer set-absolute for corrections; deltas are handy for "received a shipment of N" but are more error-prone if the base is stale — the re-read-before-submit mitigates this.
- Zero/large-decrease confirmation prevents accidental "took the product offline."
- Negative-stock rejection comes from the backend guard; present it as "can't reduce below current reserved/zero," not a raw error.

## Acceptance criteria
- [ ] Staff can set absolute stock (and optionally apply a delta) through the unified stock endpoint — never the product update.
- [ ] Large decreases / set-to-zero are confirmed.
- [ ] The form re-reads current stock and handles concurrent changes gracefully.
- [ ] Negative results are rejected with a clear message; success invalidates stock/product views.
- [ ] Post-adjust, the overview and product list show the new, synced number.

## References
- [03 step-02](../03-payment-stock-integrity/step-02-tri-store-stock-consistency.md) — the unified stock write path/endpoint (the only one this may use) + negative guard.
- [step-01](./step-01-stock-overview.md) — where the adjust flow is launched.
- [17 step-03](../17-backoffice-design-system/step-03-forms-layer.md) — form + confirm patterns.
