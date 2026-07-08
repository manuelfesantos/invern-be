---
status: Not Started
priority: P0
feature: 17-backoffice-design-system
track: backoffice-app
depends_on: ["17-backoffice-design-system/step-01", "15-backoffice-scaffolding/step-04", "07-pagination-filtering-envelope/step-02"]
blocks: ["18-backoffice-catalog/step-01", "19-backoffice-orders/step-01", "21-backoffice-users/step-01"]
---
# Step 02: Data-table layer bound to the pagination envelope

**Status:** Not Started · **Priority:** P0 · **Feature:** [Shared Design System & Data-Table Layer](./README.md)

## Technical goal
Build one reusable `<DataTable>` (TanStack Table + the owned primitives) with server-side pagination, sorting, and filtering bound to the backend's `{ data, page, pageSize, total }` envelope and sort/filter contract — so every entity list screen shares the same table UX.

## User impact
Admin staff get consistent, fast, sortable/filterable/paginated tables everywhere instead of six subtly-different implementations.

## Current state
- The primitives exist ([step-01](./step-01-owned-component-primitives.md)); the data layer + query conventions exist ([15 step-04](../15-backoffice-scaffolding/step-04-api-client-integration.md)); the backend list endpoints return the envelope and accept sort/filter after [07 step-02/03](../07-pagination-filtering-envelope/step-02-retrofit-list-endpoints.md).

## Technical steps
1. Build `<DataTable>` on TanStack Table (headless) styled with the owned primitives: column defs, header, rows, empty/loading/error states ([step-04](./step-04-states-and-accessibility.md)), and a footer with pagination controls (page, pageSize selector, total-aware page count).
2. Bind to **server-side** pagination/sort/filter: the table reads `{ data, total, page, pageSize }` from a TanStack Query call and drives `page`/`pageSize`/`sort`/`filter` query params back to the API (per [07](../07-pagination-filtering-envelope/README.md)'s contract). Do **not** load-all-then-paginate-client-side — the backend paginates for a reason.
3. Sorting: clickable sortable headers that emit the `sort` param (allow-listed per entity, matching [07 step-03](../07-pagination-filtering-envelope/step-03-filtering-and-sorting.md)); reflect current sort state in the header UI.
4. Filtering: a standard filter UI slot (search box + per-entity filter controls) that emits the `filter` params; debounce text filters; keep `total`/page-count in sync with the filtered result.
5. Row actions: a consistent actions column/menu pattern (view/edit/delete) using the dropdown + confirm-dialog primitives, so every entity's row actions look and behave the same.
6. URL-sync (recommended): reflect page/sort/filter in the URL query string so table state is shareable/bookmarkable and survives refresh.
7. Make it generic over row type `T` with typed column defs, so entity screens pass their columns + query hook and get a full table.

## Dependencies
**Depends on:** [step-01](./step-01-owned-component-primitives.md), [15 step-04](../15-backoffice-scaffolding/step-04-api-client-integration.md), [07 step-02](../07-pagination-filtering-envelope/step-02-retrofit-list-endpoints.md).
**Blocks:** every list screen ([18](../18-backoffice-catalog/README.md), [19](../19-backoffice-orders/README.md), [21](../21-backoffice-users/README.md), and the config/stock lists).

## Implementation notes
- **Server-side everything.** The table must page/sort/filter via the API, not in the browser — otherwise it re-creates the fetch-all problem [07](../07-pagination-filtering-envelope/README.md) exists to solve. The `total` from the envelope drives the page count.
- Keep sort/filter fields aligned with the backend allow-lists ([07 step-03](../07-pagination-filtering-envelope/step-03-filtering-and-sorting.md)) — a column the API can't sort by shouldn't render as sortable.
- The row-actions + confirm-dialog pattern is where destructive actions live; make it the single path so delete/cancel are always confirmed.
- Loading/empty/error states come from [step-04](./step-04-states-and-accessibility.md); the table composes them rather than inventing its own.
- Debounce filter input to avoid a request per keystroke.

## Acceptance criteria
- [ ] A generic, typed `<DataTable>` renders any entity's columns with server-side pagination, sorting, and filtering against the envelope.
- [ ] Pagination controls (page nav + pageSize) are total-aware and driven by the API.
- [ ] Sortable headers and the filter UI emit the [07](../07-pagination-filtering-envelope/README.md) contract params; only allow-listed fields are interactive.
- [ ] A consistent row-actions pattern uses the dropdown + confirm-dialog primitives.
- [ ] Table state (page/sort/filter) syncs to the URL; loading/empty/error states are handled.

## References
- [07](../07-pagination-filtering-envelope/README.md) — envelope + sort/filter contract.
- [15 step-04](../15-backoffice-scaffolding/step-04-api-client-integration.md) — the query layer the table calls.
- [step-01](./step-01-owned-component-primitives.md) — primitives (dropdown, confirm-dialog).
- [step-04](./step-04-states-and-accessibility.md) — loading/empty/error states.
- TanStack Table — the headless table engine.
