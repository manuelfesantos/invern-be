---
status: Done
priority: P1
feature: 10-taxes-admin-surface
track: backend-api-completion
depends_on: ["10-taxes-admin-surface/step-01", "01-admin-auth-rbac-cors/step-02"]
blocks: ["10-taxes-admin-surface/step-03"]
---
# Step 02: `/private/taxes` CRUD routes

**Status:** Done · **Priority:** P1 · **Feature:** [Taxes Admin Surface](./README.md)

## Technical goal
Expose the tax module (from step-01) as admin-gated `/private/taxes` (+ `/{id}`) routes with list/create/detail/update/delete, using the pagination envelope and country filtering.

## User impact
Admin staff can list taxes (optionally by country), create a tax for a country, and edit/delete tax rates from the backoffice.

## Current state
- No `/private/taxes` route exists (verified route inventory). Taxes have never been HTTP-addressable.
- The tax module (step-01) now provides validated CRUD use-cases.

## Technical steps
1. Create routes mirroring the currency/country pattern:
   - `functions/private/taxes/index.ts` → `onRequestGet` (paginated list, filter by `countryCode`), `onRequestPost` (create).
   - `functions/private/taxes/[id]/index.ts` → `onRequestGet` (detail), `onRequestPut` (update), `onRequestDelete` (delete).
2. Use the pagination envelope ([07](../07-pagination-filtering-envelope/README.md)) and the standard filter contract (filter by country) for the list.
3. Return the created/updated tax entity for POST/PUT (consistent with other admin resources).
4. If step-01 chose Stripe mirroring (option b), the create/update use-cases already handle it; the routes stay thin.
5. Admin gating is automatic via the `/private` middleware; verify no per-route auth needed.
6. Handle delete carefully: a tax referenced in historical order pricing is a snapshot (orders store computed prices, not live tax joins — verify), so deleting a tax shouldn't corrupt past orders, but it *will* change future pricing for that country. Confirm and document.

## Dependencies
**Depends on:** [step-01](./step-01-tax-module-and-rate-fix.md), [01 step-02](../01-admin-auth-rbac-cors/step-02-private-middleware-rbac.md), [07 step-01](../07-pagination-filtering-envelope/step-01-pagination-envelope-contract.md).
**Blocks:** [step-03](./step-03-taxes-swagger-and-tests.md).

## Implementation notes
- Keep the route layer thin (routes → module → db); the interesting logic (rate validation, country linkage, Stripe mirroring) lives in the module from step-01.
- If the backoffice will present taxes nested under a country ([20](../20-backoffice-commerce-config/README.md)), the `countryCode` filter on the list is what makes that view efficient — make sure it's supported and indexed reasonably (small table, so fine).
- Deleting the last tax for a country means that country's products show untaxed prices — surface that as a deliberate outcome (the UI can warn), not a silent change.

## Acceptance criteria
- [ ] `/private/taxes` supports paginated list (filterable by country) + create; `/private/taxes/{id}` supports detail + update + delete, admin-gated.
- [ ] Responses use the pagination envelope for lists and return the entity for writes.
- [ ] Delete impact on future pricing (and non-impact on historical orders) is verified and documented.
- [ ] Swagger + tests in [step-03](./step-03-taxes-swagger-and-tests.md).

## References
- `functions/private/currencies/index.ts`, `functions/private/countries/[code]/index.ts` — route pattern to mirror.
- `libs/modules/tax/**` — the module from [step-01](./step-01-tax-module-and-rate-fix.md).
- [07](../07-pagination-filtering-envelope/README.md) — envelope + filter contract.
- `libs/entities/order/**` — verify orders store price snapshots (delete safety).
