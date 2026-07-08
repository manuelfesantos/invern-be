---
status: Done
priority: P0
feature: 07-pagination-filtering-envelope
track: backend-api-completion
depends_on: ["07-pagination-filtering-envelope/step-01"]
blocks: ["07-pagination-filtering-envelope/step-03"]
---
# Step 02: Retrofit existing admin list endpoints to the envelope

**Status:** Done · **Priority:** P0 · **Feature:** [Pagination, Filtering & Response Envelope](./README.md)

> **Implementation note (2026-07-08).** All seven admin lists return the shared
> `{ data, page, pageSize, total }` envelope: `/private/orders` now forwards
> page/pageSize (kept its filters); `/private/products,collections,countries,
> currencies` gained paginated SQL actions + dedicated admin `*Page` use-cases
> (the public storefront `getAll*` fetch-all paths are untouched); `users`/`carts`
> renamed to the envelope. Verified live: paging, total, defaults, 400 on invalid
> input, pageSize cap, public product list unchanged. **Swagger:** the reusable
> `PaginationMeta` + page/pageSize params were added; per-endpoint response wiring
> is folded into feature 14 (API contract), which owns swagger and adds the CI
> check that enforces it.


## Technical goal
Make every admin list endpoint paginate and return the shared `{ data, page, pageSize, total }` envelope from step-01: finish orders pagination (already supported in the DB layer), and add pagination to the fetch-all endpoints (products, collections, countries, currencies), converting them off bare-array responses.

## User impact
Admin staff: all admin lists become paginated and uniformly shaped. Shoppers: unaffected (public routes unchanged).

## Current state
- **Already paginating** (just need envelope rename): `/private/users` (`getAllUsers` → `{ count, users }`), `/private/carts` (`getAllCarts` → `{ count, carts }`).
- **Supported in DB, dropped in use-case:** `/private/orders`. `getSelectOrdersAction`/`selectAllOrdersOperation` accept `page`/`pageSize` (`libs/db/order/actions/select.ts`, `operations/select-all-orders.ts`), but `getAllOrders` only takes `(where, selection)` and never forwards paging (`libs/modules/order/use-cases/get-all-orders.ts`). The route (`functions/private/orders/index.ts`) reads filter params but no page/pageSize.
- **Fetch-all, bare array:** `/private/products` (`getAllProducts(null, false)` → array), `/private/collections` (`getAllCollections()` → array), `/private/countries`, `/private/currencies` (`getAllCurrencies()` → array). Their DB actions do `findMany` with no limit/offset.

## Technical steps
1. Orders: extend `getAllOrders` to accept and forward `page`/`pageSize` (it already returns `{ count, orders }` from `runBatchOperationWithCount`); update the route to parse pagination via the step-01 helper and combine with the existing `userId`/`paymentId`/`shippingTransactionId`/`stripeId` filters. Return the envelope.
2. Products: add a paginated select. `getSelectProductsAction` currently `findMany`s all; add `limit`/`offset` (mirroring the orders/users pattern) and a count, via `runBatchOperationWithCount(productsTable, ...)`. Update `getAllProducts` (careful: it has overloads for `search`/`shouldExtend`) or add a dedicated admin `getProductsPage` use-case rather than overloading further — recommended: a separate admin-list use-case to avoid entangling the public search path.
3. Collections/countries/currencies: same treatment — add limit/offset + count in a paginated action, expose via the use-case, return the envelope. These are small tables today, but uniformity is the point and future growth (esp. products/collections) is real.
4. Convert all these route handlers to emit `toPaginatedResponse(...)` with `{ data, page, pageSize, total }`; rename the `{ count, users }`/`{ count, carts }` responses to the shared envelope too (users/carts adopt `data`/`total`).
5. Update `swagger.yaml` for each endpoint: pagination query params + the `PaginatedResponse` component wrapping the entity schema.
6. Tests: each endpoint returns the envelope; page/pageSize honored; total correct; default page/size applied when omitted.

## Dependencies
**Depends on:** [step-01](./step-01-pagination-envelope-contract.md).
**Blocks:** [step-03](./step-03-filtering-and-sorting.md); the backoffice list screens consume these.

## Implementation notes
- **Don't break the public product search.** `getAllProducts(search, shouldExtend)` is used by the storefront (`functions/public/.../products`) with extension + search. Keep that path intact; the admin list is a distinct concern — a separate use-case is cleaner than a third overload dimension (paging × search × extend).
- Watch response-shape assumptions elsewhere: grep for consumers of the admin list responses before renaming `count`→`total` (there shouldn't be any beyond swagger, but confirm — e.g. the storefront never calls `/private/*`).
- Keep `DEFAULT_PAGE_SIZE = 10` as the default; the backoffice can request larger pages up to the cap.
- Preserve the existing filter behavior on orders while adding paging — they combine (filter *then* paginate).

## Acceptance criteria
- [ ] `/private/orders` paginates (page/pageSize honored) and still supports its existing filters, returning the envelope.
- [ ] `/private/products`, `/collections`, `/countries`, `/currencies` paginate and return the envelope (no more bare arrays / fetch-all).
- [ ] `/private/users`, `/private/carts` return the shared `{ data, page, pageSize, total }` envelope.
- [ ] Public product search/list behavior is unchanged.
- [ ] `swagger.yaml` updated for every retrofitted endpoint; tests cover envelope + paging.

## References
- `libs/modules/order/use-cases/get-all-orders.ts`, `operations/select-all-orders.ts`, `libs/db/order/actions/select.ts` — orders paging (finish wiring).
- `libs/modules/product/use-cases/get-all-products.ts`, `libs/db/product/actions/select.ts` — products (add paginated admin path).
- `libs/modules/collection/use-cases/get-all-collections.ts`, `country/…/get-all-countries.ts`, `currency/…/get-all-currencies.ts` — fetch-all to paginate.
- `functions/private/{orders,products,collections,countries,currencies,users,carts}/index.ts` — route handlers.
- `libs/db/generics/operations/batch.ts` — `runBatchOperationWithCount`.
