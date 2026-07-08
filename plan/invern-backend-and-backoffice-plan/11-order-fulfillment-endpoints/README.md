# 11 — Order & Fulfillment Endpoint Improvements

**Status:** Not Started · **Priority:** P0 · **Track:** Backend API Completion

## Summary
Two concrete order-management gaps block a real fulfillment workflow. First, `PUT /private/orders/{id}` is a fully generic order update (it parses the whole `insertOrderSchema` and updates any field) but its route handler hardcodes the response message `"Order cancelled successfully"` regardless of what changed — a copy-paste leftover from the separate, correct `/cancel` endpoint. Second, there is no way to update fulfillment: `shippingTransactions.status` (`processing`/`shipped`/`delivered`/`canceled`) and `trackingUrl` exist in the schema and there's an `update` DB action, but **no use-case or route** exposes changing them (verified: `getUpdateShippingTransactionAction` is unused outside its own folder). This feature fixes the mislabeled update and adds a proper fulfillment-status/tracking endpoint so staff can mark orders shipped/delivered and attach tracking.

## Why this matters
Fulfillment is the operational heart of running a store: staff need to move an order from "processing" to "shipped" (with a tracking URL the customer can use) to "delivered." Today that's impossible via the API. And the generic order update returning "cancelled" is actively misleading — a backoffice built on it would tell staff every edit "cancelled" the order.

## Goals — what "done" looks like
- `PUT /private/orders/{id}` returns an accurate message and has clear, safe semantics (what an admin may change vs. what's immutable/snapshot).
- A fulfillment endpoint lets staff set `shippingTransactions.status` and `trackingUrl` (with valid state transitions), reachable per order.
- The relationship between the generic order update, the dedicated `/cancel`, and the new fulfillment update is coherent (no three-way overlap of who-cancels-what).
- Swagger + tests.

## User / business impact
Admin staff: can process fulfillment (mark shipped/delivered, add tracking) and edit orders with truthful feedback. Shoppers: accurate order status and tracking (the storefront order view can surface it). Support: fewer "where's my order" tickets.

## In scope / Out of scope
**In scope:** fix the order-update message/semantics; a shipping-transaction status + tracking update use-case + route; reconcile cancel vs update vs fulfillment; swagger; tests.
**Out of scope:** shopper-facing returns/refunds (excluded §4); carrier/label integrations; the backoffice orders UI ([19](../19-backoffice-orders/README.md)); order-list pagination/filtering (that's [07](../07-pagination-filtering-envelope/README.md)).

## Dependencies
**Depends on:** [01](../01-admin-auth-rbac-cors/README.md) (admin gate). Tests per [04](../04-testing-quality-gates/README.md).
**Blocks:** [19 — Orders & Fulfillment UI](../19-backoffice-orders/README.md); reflected in [14](../14-api-contract-typed-client/README.md).

## Steps
| # | Step | Priority | Status | Depends on |
|---|---|---|---|---|
| 01 | [Fix the order-update message & define update vs cancel semantics](./step-01-fix-order-update-semantics.md) | P0 | Not Started | — |
| 02 | [Shipping-transaction status & tracking update endpoint](./step-02-fulfillment-status-endpoint.md) | P0 | Not Started | 01-admin-auth-rbac-cors/step-02 |
| 03 | [Order/fulfillment swagger + tests](./step-03-order-fulfillment-swagger-and-tests.md) | P0 | Not Started | step-01, step-02 |

## Key risks
- **The generic order update is dangerous.** It accepts the whole order schema and can overwrite `stripeId`, `paymentId`, `products`, totals, etc. Letting an admin rewrite payment/product fields on a paid order risks corrupting financial records. Step 01 must constrain what's mutable, not just fix the message.
- **State-machine gaps.** Fulfillment status should follow valid transitions (can't go delivered→processing); allowing arbitrary jumps produces nonsense states and confuses customers.

## Relevant existing code
- `functions/private/orders/[id]/index.ts` — `onRequestPut` hardcodes `"Order cancelled successfully"`; `onRequestGet` detail.
- `libs/modules/order/use-cases/update-order.ts` — parses full `insertOrderSchema`, updates any field.
- `functions/private/orders/[id]/cancel/index.ts` + `libs/modules/order/use-cases/cancel-order.ts` — the correct, narrow cancel (`isCanceled: true`).
- `libs/db/shipping-transaction/actions/update.ts` — `getUpdateShippingTransactionAction` (exists, **unused** outside its folder).
- `libs/entities/shipping-transaction/shipping-transaction-entity.ts` — `ShippingTransactionStatusEnum` (`processing`/`shipped`/`delivered`/`canceled`), `trackingUrl`.
- `db/schema.ts` — `ordersTable` (immutable-ish fields), `shippingTransactionsTable`, `orders.shippingTransactionId` FK.
- `libs/modules/order/use-cases/get-order-from-session-result.ts` — creates the shipping transaction as `processing` at order creation.
