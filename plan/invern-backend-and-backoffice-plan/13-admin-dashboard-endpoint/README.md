# 13 — Admin Dashboard / Summary Endpoint

**Status:** Done · **Priority:** P1 · **Track:** Backend API Completion

## Summary
There is no dashboard/summary/analytics endpoint anywhere (verified via route inventory). The backoffice home screen needs a lightweight operational overview — counts of orders/products/users, low-stock items, recent orders — without the frontend making a dozen list calls and computing totals client-side. This feature adds one modest aggregate endpoint scoped to internal operations.

## Why this matters
A backoffice landing on an empty screen or forcing staff to hunt through lists to answer "how many orders today? what's low on stock? any new customers?" is poor tooling. A single summary endpoint makes the home screen fast and useful, and centralizes the aggregate queries so they're consistent and cheap.

## Scope guardrail
This is an **internal operational summary**, not the customer-facing analytics dashboard excluded in §4. Keep it modest: counts and short recent lists, not time-series charts, cohort analysis, or revenue analytics. If it grows toward business intelligence, that's a separate, out-of-scope effort.

## Goals — what "done" looks like
- One admin-gated `GET /private/dashboard` (or `/private/summary`) returning a small, well-defined aggregate payload.
- Aggregates computed efficiently (count queries, small limited selects) — not by fetching whole tables.
- A defined "low stock" threshold, reused with the stock UI ([22](../22-backoffice-stock/README.md)) and list filtering ([07](../07-pagination-filtering-envelope/README.md)).
- Swagger + tests.

## User / business impact
Admin staff: an at-a-glance operational home screen. Shoppers: none. Engineers: aggregate logic in one place.

## In scope / Out of scope
**In scope:** one summary endpoint (counts, low-stock, recent orders); efficient queries; the low-stock threshold definition; swagger; tests.
**Out of scope:** time-series/revenue analytics, charts backends, customer-facing analytics (§4); the dashboard UI ([23](../23-backoffice-dashboard/README.md)).

## Dependencies
**Depends on:** [01](../01-admin-auth-rbac-cors/README.md) (admin gate). Coordinates with [07](../07-pagination-filtering-envelope/README.md) (low-stock threshold reuse). Tests per [04](../04-testing-quality-gates/README.md).
**Blocks:** [23 — Dashboard/Home Screen](../23-backoffice-dashboard/README.md); reflected in [14](../14-api-contract-typed-client/README.md).

## Steps
| # | Step | Priority | Status | Depends on |
|---|---|---|---|---|
| 01 | [Summary aggregate endpoint](./step-01-summary-endpoint.md) | P1 | Done | 01-admin-auth-rbac-cors/step-02 |
| 02 | [Dashboard swagger + tests](./step-02-dashboard-swagger-and-tests.md) | P1 | Done | step-01 |

## Key risks
- **Expensive aggregates.** Naive implementations (fetch all orders, count in JS) reintroduce the fetch-all problem [07](../07-pagination-filtering-envelope/README.md) is fixing. Use SQL `count()` and bounded selects.
- **Scope creep toward analytics.** Keep it operational; resist adding charts/time-series that turn this into a BI endpoint.

## Relevant existing code
- `libs/db/generics/operations/batch.ts` — `runBatchOperationWithCount` / `count()` query pattern for cheap counts.
- `libs/db/product/actions/select.ts` — product/stock selects (low-stock query basis).
- `libs/modules/order/use-cases/get-all-orders.ts` / `libs/db/order/actions/select.ts` — recent-orders select (with limit/order).
- `db/schema.ts` — tables to aggregate (`orders`, `products`, `users`).
- There is **no** existing dashboard/summary module or route.
