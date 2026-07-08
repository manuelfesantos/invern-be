---
status: Not Started
priority: P1
feature: 13-admin-dashboard-endpoint
track: backend-api-completion
depends_on: ["01-admin-auth-rbac-cors/step-02"]
blocks: ["13-admin-dashboard-endpoint/step-02"]
---
# Step 01: Summary aggregate endpoint

**Status:** Not Started · **Priority:** P1 · **Feature:** [Admin Dashboard / Summary Endpoint](./README.md)

## Technical goal
Add one admin-gated endpoint returning a small operational summary — entity counts, low-stock products, and recent orders — computed with efficient queries.

## User impact
Admin staff get a fast, informative backoffice home screen instead of an empty landing or manual list-hunting.

## Current state
- No summary/dashboard endpoint or module exists.
- Cheap counting is available via `count()` (`libs/db/generics/operations/batch.ts` uses it in `runBatchOperationWithCount`).
- Recent orders can be selected with `limit` + `orderBy(createdAt desc)` (the order select already supports limit/offset).
- No "low stock" concept exists yet; define it here.

## Technical steps
1. Define the payload (keep it small and stable), e.g.:
   ```
   {
     counts: { orders, products, users, collections, activeCarts? },
     ordersToday? / ordersLast7d?: number,   // if cheap to compute
     lowStock: [{ id, name, stock }],         // products at/under threshold, limited (e.g. top 10)
     recentOrders: [{ id, createdAt, status, total? }]  // limited (e.g. 5–10)
   }
   ```
   Decide the exact fields with the [23](../23-backoffice-dashboard/README.md) UI in mind; don't over-include.
2. Define the **low-stock threshold** once (config value or constant, e.g. `stock <= LOW_STOCK_THRESHOLD`), and reuse it in the list filtering ([07 step-03](../07-pagination-filtering-envelope/step-03-filtering-and-sorting.md)) and stock UI ([22](../22-backoffice-stock/README.md)). Put it somewhere shared (e.g. `libs/utils/number` or a config module).
3. Implement a `libs/modules/dashboard/**` (or `summary`) use-case that runs the aggregates as **count queries and bounded selects** — batch them via `runBatchOperation` where possible to minimize round-trips. Never fetch whole tables.
4. Add `functions/private/dashboard/index.ts` → `onRequestGet` returning the summary; admin-gated by the `/private` middleware.
5. Keep it cheap: counts are O(1)-ish in SQLite for these table sizes; `lowStock` is a `WHERE stock <= threshold LIMIT n`; `recentOrders` is `ORDER BY createdAt DESC LIMIT n`. Confirm indexes exist or are acceptable at scale (small now).
6. Consider light caching (KV, short TTL) if the endpoint is hit on every backoffice navigation — optional; measure first.

## Dependencies
**Depends on:** [01 step-02](../01-admin-auth-rbac-cors/step-02-private-middleware-rbac.md) (gate).
**Blocks:** [step-02](./step-02-dashboard-swagger-and-tests.md).

## Implementation notes
- **Efficiency is the whole point.** If any part fetches a full table to count/aggregate in JS, it defeats the purpose — use SQL aggregates. This mirrors the discipline [07](../07-pagination-filtering-envelope/README.md) enforces on lists.
- "Active carts" count may be noisy/expensive (carts table churns) — include only if cheap and meaningful; otherwise omit.
- Revenue/`total` on recent orders requires computing from the serialized products or the payment — if that's non-trivial, omit amounts from the summary (keep it to status + date) rather than doing heavy math per row.
- The low-stock threshold being shared is what keeps the dashboard, the list filter, and the stock screen consistent — define it in exactly one place.

## Acceptance criteria
- [ ] `GET /private/dashboard` returns a small, documented summary payload, admin-gated.
- [ ] All aggregates use count queries / bounded selects (no full-table fetches) — verified by reading the queries.
- [ ] A shared low-stock threshold is defined and reused by the list filter and stock UI.
- [ ] The payload shape is agreed against the [23](../23-backoffice-dashboard/README.md) needs.
- [ ] Swagger + tests in [step-02](./step-02-dashboard-swagger-and-tests.md).

## References
- `libs/db/generics/operations/batch.ts` — `count()` / batch pattern.
- `libs/db/product/actions/select.ts` — low-stock query basis.
- `libs/db/order/actions/select.ts` — recent-orders select (limit/order).
- `db/schema.ts` — `orders`/`products`/`users`/`collections`.
- [07 step-03](../07-pagination-filtering-envelope/step-03-filtering-and-sorting.md), [22](../22-backoffice-stock/README.md) — low-stock threshold reuse.
