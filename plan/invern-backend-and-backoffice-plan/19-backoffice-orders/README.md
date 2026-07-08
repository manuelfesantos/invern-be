# 19 — Orders & Fulfillment UI

**Status:** Not Started · **Priority:** P1 · **Track:** Backoffice App

## Summary
The backoffice screens for orders: a paginated/filterable orders list, an order detail view (line items, customer, address, payment, shipping), and fulfillment actions — mark shipped/delivered with a tracking URL, and cancel — driving the order/fulfillment endpoints ([11](../11-order-fulfillment-endpoints/README.md)).

## Why this matters
Order processing is the daily operational loop of running a store: staff need to see orders, inspect details, and move them through fulfillment. Today none of this is possible via a UI, and the backend fulfillment endpoint is itself new ([11](../11-order-fulfillment-endpoints/README.md)).

## Goals — what "done" looks like
- Orders list: paginated, sortable, filterable (by status/date/customer), with key columns (id, date, customer, total, status).
- Order detail: full read view of line items, customer/address, payment, and shipping transaction status.
- Fulfillment actions: set status (valid transitions only) + tracking URL; cancel order — all with confirmation and accurate feedback (using the fixed, non-misleading endpoints from [11](../11-order-fulfillment-endpoints/README.md)).
- Consistent states and destructive-action confirmation.

## User / business impact
Admin staff: process fulfillment end-to-end. Shoppers: accurate status + tracking (storefront reflects it). Support: answer "where's my order."

## In scope / Out of scope
**In scope:** orders list, order detail, fulfillment status/tracking updates, order cancel.
**Out of scope:** refunds/returns (§4); editing order line items/amounts ([11 step-01](../11-order-fulfillment-endpoints/step-01-fix-order-update-semantics.md) constrains this); the backend order APIs ([11](../11-order-fulfillment-endpoints/README.md)).

## Dependencies
**Depends on:** [16](../16-backoffice-auth-shell/README.md), [17](../17-backoffice-design-system/README.md), [07](../07-pagination-filtering-envelope/README.md) (orders pagination/filter), [11](../11-order-fulfillment-endpoints/README.md) (fulfillment + corrected update).
**Blocks:** None.

## Steps
| # | Step | Priority | Status | Depends on |
|---|---|---|---|---|
| 01 | [Orders list screen](./step-01-orders-list-screen.md) | P1 | Not Started | 16-backoffice-auth-shell/step-03, 17-backoffice-design-system/step-02, 07-pagination-filtering-envelope/step-02 |
| 02 | [Order detail screen](./step-02-order-detail-screen.md) | P1 | Not Started | step-01 |
| 03 | [Fulfillment actions (status, tracking, cancel)](./step-03-fulfillment-actions.md) | P1 | Not Started | step-02, 11-order-fulfillment-endpoints/step-02 |

## Key risks
- **Serialized order data.** Orders store `products` as serialized text and personal details/address as (encrypted) fields; the detail view must render the parsed/extended shape, not raw serialized strings.
- **Fulfillment state machine.** The UI must offer only valid transitions ([11 step-02](../11-order-fulfillment-endpoints/step-02-fulfillment-status-endpoint.md)); showing illegal transitions leads to rejected actions and confusion.

## Relevant existing code / references
- `apps/backend/src/routes/private/orders.ts` — list/detail/cancel + the fulfillment endpoint ([11](../11-order-fulfillment-endpoints/README.md)).
- `libs/entities/order/**`, `libs/utils/extender/extend-order.ts` — the extended/client order shape for detail.
- `libs/entities/shipping-transaction/**` — status enum + tracking for the fulfillment UI.
- [11](../11-order-fulfillment-endpoints/README.md) — the endpoints (incl. the corrected update message + state machine).
