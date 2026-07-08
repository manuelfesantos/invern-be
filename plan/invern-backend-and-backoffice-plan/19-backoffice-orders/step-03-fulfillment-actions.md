---
status: Not Started
priority: P1
feature: 19-backoffice-orders
track: backoffice-app
depends_on: ["19-backoffice-orders/step-02", "11-order-fulfillment-endpoints/step-02"]
blocks: []
---
# Step 03: Fulfillment actions (status, tracking, cancel)

**Status:** Not Started · **Priority:** P1 · **Feature:** [Orders & Fulfillment UI](./README.md)

## Technical goal
Add the fulfillment actions to order detail: advance status (processing→shipped→delivered) with a tracking URL, and cancel the order — offering only valid transitions and giving accurate feedback, against the [11](../11-order-fulfillment-endpoints/README.md) endpoints.

## User impact
Admin staff move orders through fulfillment and attach tracking, and can cancel when needed — the core order-processing loop.

## Current state
- Fulfillment endpoint (`PUT /private/orders/{id}/fulfillment` or equivalent) sets status + tracking with a server-side state machine ([11 step-02](../11-order-fulfillment-endpoints/step-02-fulfillment-status-endpoint.md)).
- Cancel is `PUT /private/orders/{id}/cancel` (sets `isCanceled`); the generic update now returns accurate messages ([11 step-01](../11-order-fulfillment-endpoints/step-01-fix-order-update-semantics.md)).

## Technical steps
1. Status control: show current fulfillment status and offer only the **valid next transitions** (mirror the backend state machine from [11 step-02](../11-order-fulfillment-endpoints/step-02-fulfillment-status-endpoint.md)); e.g. from `processing` offer "Mark shipped" (+ tracking URL input) and "Cancel"; from `shipped` offer "Mark delivered".
2. Tracking URL: when marking shipped, capture a tracking URL (validated as https, matching the backend validation); allow editing it later.
3. Submit via the fulfillment endpoint → optimistic or on-success update + toast; invalidate the order query so detail/list reflect the new state.
4. Cancel: a clearly destructive, confirmed action (confirm-dialog) → the cancel endpoint; reflect the canceled state and (per [11 step-02](../11-order-fulfillment-endpoints/step-02-fulfillment-status-endpoint.md)'s decision) the linked transaction-cancel behavior.
5. Handle rejected transitions gracefully (if the server rejects an out-of-date transition due to a concurrent change, show the current state and let the user retry) — don't leave the UI in a wrong optimistic state.
6. Reflect all changes in both detail and the orders list (query invalidation).

## Dependencies
**Depends on:** [step-02](./step-02-order-detail-screen.md), [11 step-02](../11-order-fulfillment-endpoints/step-02-fulfillment-status-endpoint.md).
**Blocks:** None.

## Implementation notes
- **Offer only valid transitions.** Mirroring the backend state machine in the UI prevents rejected actions and confusion; the backend is still the enforcer, but the UI shouldn't present impossible options.
- Tracking URL validation must match the backend (https-only) so the UI doesn't accept what the API rejects.
- Cancel vs fulfillment-cancel: follow [11 step-02](../11-order-fulfillment-endpoints/step-02-fulfillment-status-endpoint.md)'s decision on whether canceling an order also sets the transaction to `canceled`; present it consistently so staff aren't confused by two "canceled" concepts.
- Consider that marking `shipped` is the natural trigger for a future "order shipped" email (not in scope; note it).

## Acceptance criteria
- [ ] Order detail offers only valid fulfillment transitions and captures a validated (https) tracking URL when shipping.
- [ ] Status/tracking updates persist via the fulfillment endpoint and refresh detail + list.
- [ ] Cancel is a confirmed destructive action reflecting the correct canceled state.
- [ ] Server-rejected transitions are handled without leaving a wrong optimistic state.
- [ ] Feedback messages are accurate (no "cancelled" for a status update — the [11 step-01](../11-order-fulfillment-endpoints/step-01-fix-order-update-semantics.md) fix).

## References
- [11 step-01](../11-order-fulfillment-endpoints/step-01-fix-order-update-semantics.md), [11 step-02](../11-order-fulfillment-endpoints/step-02-fulfillment-status-endpoint.md) — the endpoints + state machine.
- `libs/entities/shipping-transaction/**` — status enum + tracking validation.
- [17 step-01](../17-backoffice-design-system/step-01-owned-component-primitives.md) — confirm-dialog for cancel.
