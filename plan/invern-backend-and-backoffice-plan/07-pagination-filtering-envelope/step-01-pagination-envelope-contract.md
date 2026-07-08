---
status: Done
priority: P0
feature: 07-pagination-filtering-envelope
track: backend-api-completion
depends_on: []
blocks: ["07-pagination-filtering-envelope/step-02", "08-shipping-admin-endpoints/step-01"]
---
# Step 01: Define the shared pagination envelope & query contract

**Status:** Done · **Priority:** P0 · **Feature:** [Pagination, Filtering & Response Envelope](./README.md)

> **Implementation note (2026-07-08).** `libs/entities/pagination` exports
> `paginationQuerySchema` (coerces + defaults page=1/pageSize=10, min 1, max cap
> 100), `Paginated<T>`, and `toPaginatedResponse`. Invalid pagination now yields a
> 400 (ZodError) instead of a bare-Error 500. `getAllUsers`/`getAllCarts` adopt it
> as the first consumers. The runtime `paginatedResponseSchema` helper was omitted
> as unused (responses are built, not parsed); the envelope is documented via the
> `Paginated<T>` type and the `PaginationMeta` swagger component. Unit tests in
> `test/unit/pagination.test.ts`.


## Technical goal
Define one reusable paginated-response envelope and one query-parameter contract (page, pageSize, sort, filter), as Zod schemas + helper functions, so every admin list endpoint parses input and shapes output identically.

## User impact
None directly; establishes the contract the backoffice's data table binds to.

## Current state
- Envelopes are inconsistent: `{ count, users }`, `{ count, carts }`, `{ count, orders }`, and bare arrays for products/collections/countries/currencies (verified across the `functions/private/*` handlers and `get-all-*` use-cases).
- Defaults exist (`DEFAULT_PAGE`, `DEFAULT_PAGE_SIZE = 10` in `libs/utils/number/index.ts`) and `runBatchOperationWithCount` already returns a total count.
- Page/pageSize validation is duplicated inline in `getAllUsers`/`getAllCarts` (NaN + `<= 0` checks throwing `new Error(...)`).

## Technical steps
1. Add a pagination entity module (e.g. `libs/entities/pagination/**`) exporting:
   - `paginationQuerySchema` — parses/validates `page` (default 1, ≥1) and `pageSize` (default 10, ≥1, with a sane **max cap**, e.g. 100, to prevent abusive page sizes). Coerce from string query params.
   - `sortQuerySchema` — parses `sort` (e.g. `field:asc|desc`, or `sort`+`order` pair — pick one and document it), validated against an allow-list of sortable fields **per entity** (passed in by the caller) to prevent arbitrary-column sorting.
   - A generic `paginatedResponseSchema(dataSchema)` producing `{ data, page, pageSize, total }` and a `toPaginatedResponse(data, { page, pageSize, total })` helper.
2. Replace the ad-hoc inline validation in `getAllUsers`/`getAllCarts` with the shared parser (behavior-preserving) as the first adopters.
3. Standardize the envelope key names on `{ data, page, pageSize, total }` (rename `count`→`total`, entity-array→`data`). Document the choice in the pagination module and in `swagger.yaml` as a reusable component (`PaginatedResponse`).
4. Provide a route-level helper that reads query params via the existing `getQueryFromUrl`, runs `paginationQuerySchema`, and returns typed `{ page, pageSize, sort, filter }`, so handlers don't re-parse manually.
5. Add unit tests: defaults, bounds (page/pageSize ≥1, max cap), string coercion, invalid input → validation error (400, not a thrown generic `Error`).
6. Wire validation failures to a proper `400` response (currently `getAllUsers` throws a bare `Error` on bad page → generic 500). Use the shared error responses.

## Dependencies
**Depends on:** None.
**Blocks:** [step-02](./step-02-retrofit-list-endpoints.md) and every list endpoint in Track B.

## Implementation notes
- **Cap `pageSize`.** Without a max, a caller can request `pageSize=1000000` and force a full-table scan — the very thing pagination is meant to prevent. Enforce and document the cap.
- **Sort must be allow-listed per entity**, not free-form — passing a raw column name into an ORDER BY is an injection/exposure risk and couples the API to column names. The schema takes the allowed fields from the endpoint.
- Keep `filter` generic here (a typed bag the entity endpoints interpret in [step-03](./step-03-filtering-and-sorting.md)); don't over-specify filtering in this step.
- Renaming `count`→`total` and array→`data` is a breaking envelope change — acceptable pre-launch with no admin client yet, but do it once, here, consistently.

## Acceptance criteria
- [ ] `paginationQuerySchema`, `sortQuerySchema`, `paginatedResponseSchema`/`toPaginatedResponse` exist and are tested.
- [ ] `pageSize` is capped; invalid pagination input yields a `400`, not a 500.
- [ ] `getAllUsers`/`getAllCarts` use the shared parser with unchanged external behavior (aside from the envelope rename, applied in step-02).
- [ ] The envelope shape `{ data, page, pageSize, total }` is documented as a reusable `swagger.yaml` component.
- [ ] Sort fields are validated against a per-entity allow-list.

## References
- `libs/utils/number/index.ts` — defaults.
- `libs/db/generics/operations/batch.ts` — `runBatchOperationWithCount` (total count).
- `libs/modules/user/use-cases/get-all-users.ts`, `cart/use-cases/get-all-carts.ts` — inline validation to replace.
- `libs/utils/http/**` — `getQueryFromUrl`.
- `libs/entities/response/**` — success/error response builders.
