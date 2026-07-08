---
status: Not Started
priority: P1
feature: 21-backoffice-users
track: backoffice-app
depends_on: ["16-backoffice-auth-shell/step-03", "17-backoffice-design-system/step-02", "12-user-admin-actions/step-02"]
blocks: ["21-backoffice-users/step-02"]
---
# Step 01: Users list & detail

**Status:** Not Started · **Priority:** P1 · **Feature:** [User / Customer Management UI](./README.md)

## Technical goal
Build the users list (paginated/filterable) and a safe full-detail view using the admin projection, never exposing secrets.

## User impact
Admin staff can find users (by email/role/validation) and inspect an account's details.

## Current state
- `GET /private/users` paginates (`{ count, users }` → envelope after [07 step-02](../07-pagination-filtering-envelope/step-02-retrofit-list-endpoints.md)). `GET /private/users/{id}` returns detail — replaced with the safe `adminUserSchema` projection by [12 step-02](../12-user-admin-actions/step-02-user-admin-endpoints.md).
- Filters (role, validation, email) come from [07 step-03](../07-pagination-filtering-envelope/step-03-filtering-and-sorting.md).

## Technical steps
1. Users list via `<DataTable>`: columns email, name, role (badge), validated (badge), created; filters for role, validation status, email search; sort by createdAt/email.
2. User detail route: render the safe projection — email, name, role, validation, isOauth, created, cart summary, order count/list link. **Never** render password/hash.
3. Row/detail navigation; the actions themselves are [step-02](./step-02-user-admin-actions-ui.md).
4. Standard states; handle the not-found case.

## Dependencies
**Depends on:** [16 step-03](../16-backoffice-auth-shell/step-03-app-shell-nav-layout.md), [17 step-02](../17-backoffice-design-system/step-02-data-table-component.md), [12 step-02](../12-user-admin-actions/step-02-user-admin-endpoints.md).
**Blocks:** [step-02](./step-02-user-admin-actions-ui.md).

## Implementation notes
- Rely on the backend's safe projection; as defense-in-depth, don't render any unexpected sensitive field even if present. A test asserting no password field renders is cheap insurance.
- Link a user's orders (filter the orders list by userId — the orders endpoint supports that filter) rather than duplicating order rendering here.
- Role/validation as badges reuse the shared Badge variants.

## Acceptance criteria
- [ ] Users list renders via `<DataTable>` with role/validation/email filters and sorting.
- [ ] User detail shows the safe projection (role, validation, cart/order summary); no password/hash ever rendered.
- [ ] A user's orders are reachable (via the orders list userId filter).
- [ ] Standard/not-found states handled.

## References
- `apps/backend/src/routes/private/users.ts` — endpoints.
- `libs/entities/user/user-entity.ts` — safe projection ([12 step-01](../12-user-admin-actions/step-01-user-admin-scope.md)).
- [07](../07-pagination-filtering-envelope/README.md) — filters.
