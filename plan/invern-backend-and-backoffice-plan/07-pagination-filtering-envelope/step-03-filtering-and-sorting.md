---
status: Done
priority: P1
feature: 07-pagination-filtering-envelope
track: backend-api-completion
depends_on: ["07-pagination-filtering-envelope/step-02"]
blocks: []
---
# Step 03: Standard filtering & sorting for admin lists

**Status:** Done · **Priority:** P1 · **Feature:** [Pagination, Filtering & Response Envelope](./README.md)

## Verified implementation (SPIRIT-107)
Built a shared, allow-list-driven sort/filter mechanism and applied it to **all
seven** admin list endpoints.

Shared infrastructure:
- `@pagination-entity`: added `SORT_ORDERS`/`SortOrder`, `ListQuery<F>`, and
  `parseListQuery(sortableFields, query)` — extends `paginationQuerySchema` with
  a `sortBy` constrained to the entity's allow-list (`z.enum`) and a bounded
  `sortOrder` (default asc). An out-of-allow-list `sortBy` → ZodError → **400**.
- `@generics-db` `list-query.ts`: `buildOrderBy(sortMap, sortBy, sortOrder)` and
  `buildWhere(filterMap, query)` plus reusable filter builders `eqFilter`,
  `likeFilter` (bound `%term%`), `boolFilter` (only true/false), `maxNumberFilter`
  (`<=`, for low-stock). Field/filter *names* never reach SQL — only mapped
  columns and Drizzle-bound values do.
- `runBatchOperationWithCount(table, action, where?)`: the count query now takes
  the same `where` as the data query, so the envelope `total` is the **filtered**
  count. (Signature tightened to a single data action — every caller passed one.)
- `@http-utils`: replaced `getPaginationParams` with `getListQueryParams(url)`
  (full query record) — the use-cases validate/pick from it.

Per-entity allow-lists (sort → filter):
- **products**: name/stock/priceInCents/createdAt → collectionId(eq),
  name(like), maxStock(≤).
- **orders**: createdAt/lastModifiedAt/isCanceled → the legacy id filters
  (userId/paymentId/shippingTransactionId/stripeId) **folded into the standard
  contract, now AND-combinable** + isCanceled(bool). The bespoke if/else route
  handling was removed.
- **users**: createdAt/email → email(like), role(eq), isValidated(bool).
- **collections**: name/createdAt → name(like).
- **currencies**: name/code/rateToEuro/createdAt → name(like), code(like).
- **countries**: name/code/createdAt → name(like), code(like), currencyCode(eq).
- **carts**: createdAt/lastModifiedAt → isLoggedIn(bool).

`swagger.yaml`: added a reusable `SortOrderParam` and documented `sortBy` (with
the enum) + filter params on every list GET; also fixed pre-existing broken
`$ref`s to the non-existent `PageQuery`/`PageSizeQuery` on the orders/users/carts
blocks (now `PageParam`/`PageSizeParam`).

Design note (deviation from acceptance criteria): **unknown filter keys are
ignored, not 400'd** — only `sortBy` is strictly rejected. `buildWhere` reads
only mapped keys, so an unknown filter has zero effect on SQL; hard-400 on any
stray query param would break clients that append tracking/cache params. Sort
allow-listing (the injection-relevant surface) is strict.

Verified live (seeded local D1, admin-authed): sort name asc/desc orders
correctly; `?name=Strata` → total=4 (filtered count, not 12); `?maxStock=5` →
total=1; `?name=Vase&sortBy=name&sortOrder=desc` composes filter+sort;
`?sortBy=password` → **400**; users `?role=ADMIN`/`?isValidated=true` narrow
correctly. Unit tests: `parse-list-query` (allow-list + 400) and
`list-query-builders` (builder decision logic) — 15 new tests. Full suite
88/88, type-check (root + apps) clean, lint 0 errors.

## Technical goal
Add a consistent, safe filtering and sorting capability to the admin list endpoints so backoffice tables can sort by column and filter by the fields staff actually search on (order status/date, product name/collection/stock, user email/validation, etc.), using the per-entity allow-lists from step-01.

## User impact
Admin staff: can sort and filter large lists (find an order by status, products low on stock, unvalidated users) instead of paging blindly.

## Current state
- No sorting anywhere; list order is whatever the DB returns (products already order images by thumbnail, but the product list itself is unordered).
- The only filtering that exists is `/private/orders`' fixed set of exact-match query params (`userId`/`paymentId`/`shippingTransactionId`/`stripeId`) handled by an if/else chain in the route (`functions/private/orders/index.ts`) → `getAllOrders(where, selection)` → `eq(ordersTable[where], selection)`.
- `sortQuerySchema` + per-entity allow-lists were defined in [step-01](./step-01-pagination-envelope-contract.md) but not yet applied.

## Technical steps
1. For each admin list entity, define its **sortable** and **filterable** field allow-lists (e.g. orders: sort by createdAt/status; filter by isCanceled, shippingTransaction.status, date range, the existing id filters — products: sort by name/stock/priceInCents/createdAt; filter by collectionId, name `LIKE`, low-stock threshold — users: sort by createdAt/email; filter by isValidated, role, email `LIKE`).
2. Extend the list use-cases/actions to accept a validated `sort` (field + direction, applied as Drizzle `orderBy(asc|desc(column))` chosen from the allow-list map — never from a raw string) and a `filter` object (translated to `where` conditions, combining with `and`).
3. Generalize the orders route's bespoke if/else filter handling into the standard `filter` contract so it's consistent with the other entities (keep backward-compatible param names or update swagger + the backoffice accordingly — pre-launch, prefer updating to the standard).
4. Keep filters parameterized (Drizzle builds parameterized SQL; never string-concatenate values) and bounded (text filters use `LIKE` with the user term as a bound parameter, as the existing public product search does).
5. Update `swagger.yaml`: document each endpoint's supported `sort` fields and `filter` params.
6. Tests: sort direction correctness; filter narrowing + count reflects the filter; rejecting a non-allow-listed sort/filter field with `400`.

## Dependencies
**Depends on:** [step-02](./step-02-retrofit-list-endpoints.md) (endpoints must paginate/envelope first).
**Blocks:** None (but the backoffice list screens' sort/filter UX in [17](../17-backoffice-design-system/README.md)/[18](../18-backoffice-catalog/README.md)–[21](../21-backoffice-users/README.md) build on it).

## Implementation notes
- **Total must reflect filters.** When a filter is applied, the envelope's `total` must be the *filtered* count (so the table's page count is right). `runBatchOperationWithCount` counts the whole table — the count query needs the same `where` as the data query. Verify and fix, or the pagination UI will be wrong.
- **Allow-list everything.** Sort field, sort direction, and filter keys all come from fixed maps; reject anything else with a 400. This prevents ordering/filtering by unintended columns and keeps the API decoupled from raw column names.
- Low-stock filtering ties into the dashboard ([13](../13-admin-dashboard-endpoint/README.md)) and stock UI ([22](../22-backoffice-stock/README.md)) — define the "low stock" threshold once (config or query param) and reuse.
- Keep it modest: implement the filters staff will actually use, not a generic query language. This is not faceted search (excluded per §4).

## Acceptance criteria
- [ ] Each admin list endpoint supports sorting on its allow-listed fields (asc/desc) and filtering on its allow-listed fields.
- [ ] The envelope `total` reflects applied filters (filtered count, test-proven).
- [ ] Non-allow-listed sort/filter fields are rejected with `400`.
- [ ] Orders' legacy id-filters are folded into the standard filter contract (or documented as retained).
- [ ] `swagger.yaml` documents supported sort/filter params per endpoint; tests cover sort, filter, and filtered-count.

## References
- `functions/private/orders/index.ts`, `libs/modules/order/use-cases/get-all-orders.ts` — existing bespoke filtering to generalize.
- `libs/db/*/actions/select.ts` — where `orderBy`/`where` are added per entity.
- `libs/db/product/actions/select.ts` — existing `LIKE`-based search to mirror for text filters.
- `libs/db/generics/operations/batch.ts` — count query (must honor filters).
- [step-01](./step-01-pagination-envelope-contract.md) — `sortQuerySchema` + allow-list mechanism.
