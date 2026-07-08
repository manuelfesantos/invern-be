---
status: Not Started
priority: P0
feature: 08-shipping-admin-endpoints
track: backend-api-completion
depends_on: ["01-admin-auth-rbac-cors/step-02", "07-pagination-filtering-envelope/step-01"]
blocks: ["08-shipping-admin-endpoints/step-02"]
---
# Step 01: Shipping method admin use-cases & routes

**Status:** Not Started · **Priority:** P0 · **Feature:** [Shipping Admin Endpoints](./README.md)

## Technical goal
Add admin use-cases and `/private/shipping/methods` (+ `/{id}`) routes for full CRUD of shipping methods, over the already-existing method DB actions, following the established layering.

## User impact
Admin staff can create, rename, list, and delete shipping methods from the backoffice.

## Current state
- DB actions exist and are unused for admin: `getInsertShippingMethodAction`, `getUpdateShippingMethodAction`, `getDeleteShippingMethodAction`, `getSelectShippingMethod(s)Action` (`libs/db/shipping/method/actions/*`).
- Only checkout-facing use-cases exist: `getShippingMethods` (per cart/country) and `handleShippingMethodPost` (select a method during checkout) — neither is admin CRUD (`libs/modules/shipping/use-cases/method/*`).
- No `functions/private/shipping/` folder exists.
- `shippingMethodsTable` is just `{ id, name, timestamps }` (`db/schema.ts`); a method's rates are separate (step-02).

## Technical steps
1. Add admin use-cases under `libs/modules/shipping/use-cases/method/admin/` (or similar): `addShippingMethod(body)`, `updateShippingMethod(id, body)`, `deleteShippingMethod(id)`, `getShippingMethodsPage(pagination)`, `getShippingMethodById(id)` — thin wrappers over the DB actions with Zod validation (`insertShippingMethodSchema` from `libs/entities/shipping/**`; add one if absent, mirroring how currency/country entities define insert schemas via drizzle-zod).
2. Create routes mirroring the currency pattern:
   - `functions/private/shipping/methods/index.ts` → `onRequestGet` (paginated list), `onRequestPost` (create).
   - `functions/private/shipping/methods/[id]/index.ts` → `onRequestGet` (detail incl. its rates), `onRequestPut` (update), `onRequestDelete` (delete).
3. Use the pagination envelope ([07](../07-pagination-filtering-envelope/README.md)) for the list; return the created/updated entity for POST/PUT (consistent with currency/country handlers).
4. Delete semantics: check for references before hard-deleting (a method with rates, or referenced by historical orders). Prefer failing with a clear error when rates exist ("delete/reassign rates first") or cascade per the schema's `onDelete: "cascade"` from method→rate→rate-to-country — decide explicitly and document; soft-delete/deactivation is safer if orders reference methods (see feature README risk).
5. Confirm admin gating: the `/private` middleware from [01 step-02](../01-admin-auth-rbac-cors/step-02-private-middleware-rbac.md) already covers `/private/shipping/*` by prefix — verify no per-route auth is needed.

## Dependencies
**Depends on:** [01 step-02](../01-admin-auth-rbac-cors/step-02-private-middleware-rbac.md) (admin gate), [07 step-01](../07-pagination-filtering-envelope/step-01-pagination-envelope-contract.md) (envelope).
**Blocks:** [step-02](./step-02-shipping-rate-admin.md).

## Implementation notes
- Respect the layer boundaries the codebase enforces (routes → modules → db actions → entities); don't call DB actions directly from the route (the eslint `import/no-restricted-paths` rules enforce this).
- The `getShippingMethodById` detail should include the method's rates (join) so the backoffice method-detail screen has what it needs in one call — reuse the existing select-with-rates query if present (`getSelectShippingMethodAction` loads rates for checkout; check its shape and whether it filters by weight — the admin detail wants *all* rates unfiltered).
- Keep create/update payloads minimal (`name`) — rates are managed separately in step-02.

## Acceptance criteria
- [ ] `/private/shipping/methods` supports paginated list + create; `/private/shipping/methods/{id}` supports detail + update + delete, all admin-gated.
- [ ] Admin use-cases validate input with Zod and sit in the module layer (no route→db shortcut).
- [ ] Delete semantics for methods-with-rates are explicit and safe (documented).
- [ ] List uses the pagination envelope; detail includes the method's rates.
- [ ] Swagger + tests handled in [step-04](./step-04-shipping-swagger-and-tests.md).

## References
- `libs/db/shipping/method/actions/*` — the DB actions to wrap.
- `libs/modules/shipping/use-cases/method/*` — existing checkout use-cases (pattern + `getSelectShippingMethodAction` shape).
- `functions/private/currencies/index.ts`, `functions/private/currencies/[code]/index.ts` — the route pattern to mirror.
- `libs/entities/shipping/**` — schemas (add an insert schema if missing).
- `db/schema.ts` — `shippingMethodsTable` and its cascade relations.
