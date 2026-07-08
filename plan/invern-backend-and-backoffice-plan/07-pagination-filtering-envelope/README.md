# 07 — Pagination, Filtering & Response Envelope

**Status:** Done · **Priority:** P0 · **Track:** Backend API Completion

> **Done (SPIRIT-107):** all three steps complete — the `{ data, page, pageSize, total }` envelope, every admin list endpoint paginated, and the allow-list-driven sort/filter contract (filtered `total`, 400 on non-allow-listed sort). Verified via 88 unit tests + a live authenticated sweep of all 7 list endpoints.

## Summary
Admin list endpoints are inconsistent about pagination and have no standard response shape. `/private/users` and `/private/carts` paginate and return `{ count, users }` / `{ count, carts }`; `/private/orders` returns `{ count, orders }` but the use-case **drops** the page/pageSize the DB layer supports; `/private/products`, `/collections`, `/countries`, `/currencies` fetch the entire table and return a bare array. None support filtering or sorting. This feature defines one paginated-response envelope, applies it uniformly, finishes orders pagination, paginates the fetch-all endpoints, and adds a standard filter/sort query contract — the prerequisite for every backoffice data-table screen.

## Why this matters
A data table over thousands of orders or products cannot load the whole table on every view — it's slow, expensive, and eventually breaks. The backoffice's shared table component ([17](../17-backoffice-design-system/README.md)) needs one predictable `{ data, page, pageSize, total }` contract to build server-side pagination, sorting and filtering against. Inconsistent envelopes force per-screen special-casing, which is exactly the per-screen reinvention this program is trying to avoid.

## Why this matters for the backoffice specifically
Feature [17 — Shared Design System & Data-Table Layer](../17-backoffice-design-system/README.md) builds one `<DataTable>` bound to this envelope; every entity list screen (18–23) uses it. If the envelope isn't uniform, each screen needs bespoke fetching/pagination glue.

## Goals — what "done" looks like
- One documented paginated envelope — `{ data, page, pageSize, total }` (see root README assumptions) — used by every admin list endpoint.
- `/private/orders` actually paginates (wire the existing DB-layer support through the use-case).
- `/private/products`, `/collections`, `/countries`, `/currencies` paginate instead of fetching all.
- A standard, documented query contract for `page`, `pageSize`, `sort`, and per-entity `filter` params, validated consistently.
- `swagger.yaml` documents the envelope + query params; the generated client ([14](../14-api-contract-typed-client/README.md)) exposes them typed.

## User / business impact
Admin staff: fast, paginated, sortable, filterable lists that stay usable as data grows. Shoppers: none (public list endpoints are separate; only change public ones if explicitly needed — default: don't). Engineers: one pattern instead of six.

## In scope / Out of scope
**In scope:** the shared envelope + query contract; retrofitting all admin list endpoints; validation; swagger. New Track B endpoints (shipping, images, taxes) adopt the envelope from birth (their own features reference this one).
**Out of scope:** the public storefront list endpoints (leave their shapes unless a shared helper naturally covers them); full-text search improvements (excluded per §4); the backoffice table UI (feature 17).

## Dependencies
**Depends on:** None (can start Phase 0). Coordinates with [04](../04-testing-quality-gates/README.md) for tests and [14](../14-api-contract-typed-client/README.md) for the contract.
**Blocks:** [17 — Design System & Data Table](../17-backoffice-design-system/README.md); all backoffice list screens (18–23); the list endpoints in [08](../08-shipping-admin-endpoints/README.md)/[09](../09-image-management-upload/README.md)/[10](../10-taxes-admin-surface/README.md)/[12](../12-user-admin-actions/README.md).

## Steps
| # | Step | Priority | Status | Depends on |
|---|---|---|---|---|
| 01 | [Define the shared pagination envelope & query contract](./step-01-pagination-envelope-contract.md) | P0 | Done | — |
| 02 | [Retrofit existing admin list endpoints to the envelope](./step-02-retrofit-list-endpoints.md) | P0 | Done | step-01 |
| 03 | [Standard filtering & sorting for admin lists](./step-03-filtering-and-sorting.md) | P1 | Not Started | step-02 |

## Key risks
- **Inconsistent existing shapes create migration risk.** Changing `/private/products` from a bare array to an envelope is a breaking change; since the only consumer is the (not-yet-built) backoffice and there's no public admin client, now is the time — but confirm nothing else (scripts, the storefront) calls admin list routes.
- **Offset pagination at scale.** SQLite `LIMIT/OFFSET` (what the code uses) degrades on deep pages. Fine for admin volumes; note cursor-pagination as a future option if any list grows huge.

## Relevant existing code
- `libs/utils/number/index.ts` — `DEFAULT_PAGE = 1`, `DEFAULT_PAGE_SIZE = 10`, `NUMBER_ZERO`.
- `libs/db/generics/operations/batch.ts` — `runBatchOperationWithCount` (already returns `[count, ...results]`).
- `libs/modules/user/use-cases/get-all-users.ts`, `cart/use-cases/get-all-carts.ts` — the paginating pattern to generalize (validate page/pageSize, `runBatchOperationWithCount`).
- `libs/modules/order/use-cases/get-all-orders.ts` — **drops** page/pageSize; `operations/select-all-orders.ts` + `libs/db/order/actions/select.ts` already accept them.
- `libs/modules/product/use-cases/get-all-products.ts`, `collection/…/get-all-collections.ts`, `country/…/get-all-countries.ts`, `currency/…/get-all-currencies.ts` — fetch-all, no pagination.
- `functions/private/{users,carts,orders,products,collections,countries,currencies}/index.ts` — route handlers (some already read `page`/`pageSize` from query).
- `libs/utils/http/**` — `getQueryFromUrl` (query parsing helper).
