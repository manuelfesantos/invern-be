---
status: Not Started
priority: P1
feature: 12-user-admin-actions
track: backend-api-completion
depends_on: []
blocks: ["12-user-admin-actions/step-02"]
---
# Step 01: Define admin user-management scope & safeguards

**Status:** Not Started · **Priority:** P1 · **Feature:** [User Admin Actions](./README.md)

## Technical goal
Turn "the backoffice can manage users" into an explicit, agreed specification: which fields/actions are exposed, their safeguards, and any schema changes required (notably a disable/deactivation representation).

## User impact
None yet (a specification step); determines what staff will be able to do to accounts.

## Current state
- Admin user surface today: list, detail, hard-delete. No update of any field. No `disabled`/`deactivated` column exists (`db/schema.ts` `usersTable` has `role`, `isValidated`, `version`, `isOauth`, `googleUserId`).
- `role` defaults to `USER` and is currently unenforced; [01](../01-admin-auth-rbac-cors/README.md) makes it load-bearing.
- Hard-delete cascades (order `onDelete: cascade` from user; cart deleted explicitly in `deleteUser`) — deleting a user removes their orders, which is likely **not** what's wanted for record-keeping.

## Technical steps
1. Produce the specification (confirm with the user — open question 4):
   - **Role change:** promote/demote `USER`↔`ADMIN`. Safeguards: only admins (RBAC), cannot demote the last remaining admin, log the change, and invalidate the target's sessions so the new role takes effect promptly (ties to [02](../02-credential-session-hardening/README.md) — bump `version` / revoke refresh secret).
   - **Validation toggle:** mark a user validated/unvalidated (e.g. to unblock a customer whose email failed) — sets `isValidated`.
   - **Disable/enable (soft):** the recommended alternative to hard-delete for problem accounts. Requires adding a `disabled`/`isActive` column and honoring it in login/credential resolution.
   - **Hard delete:** retain the existing capability but guard it (confirmation, and reconsider the order-cascade — see below).
2. Decide the delete-vs-order-cascade question: hard-deleting a user currently cascades their orders (financial records vanish). Recommend switching order retention to soft (`user_id` set null / disable instead of delete), or restricting hard-delete to accounts with no orders. Document the decision; it may require a schema/FK change (currently `orders.userId ... onDelete: "cascade"`).
3. Define the safe admin **detail projection**: all operationally-useful fields (id, email, name, role, isValidated, isOauth, createdAt, cart summary, order count) but **never** `password` and not the raw `googleUserId` hash. Add an `adminUserSchema` distinct from `userDTOSchema` (which omits role — admins need role).
4. Enumerate the schema changes needed (disable column; possibly FK change for orders) and route them through the migration workflow ([05 step-05](../05-configuration-data-hygiene/step-05-wrangler-config-and-readme.md)).
5. Record the final scope in this step's PR/README so [step-02](./step-02-user-admin-endpoints.md) and [21](../21-backoffice-users/README.md) build exactly that.

## Dependencies
**Depends on:** None (decision), but interlocks with [01](../01-admin-auth-rbac-cors/README.md)/[02](../02-credential-session-hardening/README.md).
**Blocks:** [step-02](./step-02-user-admin-endpoints.md).

## Implementation notes
- **The last-admin guard is not optional.** Without it, an admin can demote themselves (or the only other admin) and lock everyone out of the backoffice — with no UI to recover (back to `wrangler d1 execute`). Enforce it server-side.
- Prefer **disable over delete** for the common "problem account" case; hard-delete destroying order history is usually the wrong default for a store.
- Keep GDPR in mind: a genuine data-deletion request is a real need (there's a public `DELETE .../user` path for self-deletion). Admin hard-delete can serve that, but distinguish "erase for privacy" from "deactivate for ops" — they have different data-retention semantics.

## Acceptance criteria
- [ ] A written, user-confirmed spec of admin user actions + safeguards exists.
- [ ] The disable/deactivation representation (schema change) is decided.
- [ ] The delete-vs-order-cascade decision is documented (retain vs restrict vs soften).
- [ ] A safe `adminUserSchema` projection (role-including, password-excluding) is defined.
- [ ] Required schema migrations are enumerated and routed through the migration workflow.

## References
- `functions/private/users/[id]/index.ts`, `libs/modules/user/use-cases/{get-user,delete-user}.ts` — current surface.
- `libs/entities/user/user-entity.ts` — `userDTOSchema` (omits role), `UserValidationStatusEnum`.
- `db/schema.ts` — `usersTable` (no disable column), `orders.userId` cascade.
- [01](../01-admin-auth-rbac-cors/README.md), [02](../02-credential-session-hardening/README.md) — role enforcement + session revocation this must cooperate with.
