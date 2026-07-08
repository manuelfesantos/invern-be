---
status: Not Started
priority: P1
feature: 12-user-admin-actions
track: backend-api-completion
depends_on: ["12-user-admin-actions/step-01", "01-admin-auth-rbac-cors/step-02"]
blocks: ["12-user-admin-actions/step-03"]
---
# Step 02: Implement user admin update endpoints

**Status:** Not Started · **Priority:** P1 · **Feature:** [User Admin Actions](./README.md)

## Technical goal
Implement the admin user actions agreed in step-01: role change, validation toggle, disable/enable, and a safe full-detail projection — with the mandated safeguards and correct interplay with RBAC and session revocation.

## User impact
Admin staff can promote/demote users, mark accounts validated, and disable/enable accounts from the backoffice.

## Current state
- Only list/detail/delete exist; no update use-case for users at the admin layer (`getUpdateUserAction` exists in the DB layer but isn't wired to any admin route).
- `getUser(id, false)` returns the full `User` **including `password`** — unsafe to return as admin detail as-is.
- `getIncrementUserVersionAction` exists (bumps `version`) — usable as the session-invalidation lever if [02](../02-credential-session-hardening/README.md) makes `version` gate auth, or pair with refresh-secret revocation.

## Technical steps
1. Add admin use-cases (`libs/modules/user/use-cases/admin/**`): `updateUserRole(id, role)`, `setUserValidated(id, bool)`, `setUserDisabled(id, bool)` (if step-01 added the column), and `getAdminUserDetail(id)` returning the safe `adminUserSchema` projection (from step-01).
2. Routes: extend `functions/private/users/[id]/index.ts` with `onRequestPut`/`onRequestPatch` for the update actions (a single patch taking a validated partial, or discrete sub-routes like `/role`, `/validation`, `/status` — recommend a single `PATCH /private/users/{id}` with a whitelist for fewer endpoints, or discrete routes for clearer audit; pick and document). Keep the existing delete but add a guard/confirmation semantics as decided.
3. Enforce safeguards in the use-cases:
   - **Last-admin guard:** demoting/deleting/disabling would leave zero `ADMIN`s → reject (`409`/`400` with a clear message). Requires a "count admins" query.
   - **Self-action care:** an admin demoting/disabling themselves should be allowed only with explicit intent (the UI confirms; the API can allow but log prominently) — but still blocked by the last-admin guard.
4. Propagate role/disable changes to sessions: on role change or disable, invalidate the target's active session (revoke the `AUTH_KV` refresh secret via `deleteAuthSecret`, and/or bump `version` if [02](../02-credential-session-hardening/README.md) wired version-checking). Otherwise a demoted admin keeps admin access until their ≤15-min access token expires and a disabled user stays logged in.
5. Honor `disabled` at auth time: update login and credential resolution to reject disabled accounts (coordinate with [02](../02-credential-session-hardening/README.md)). A disable that login ignores is cosmetic.
6. Replace the unsafe detail return with `getAdminUserDetail` (safe projection) on `GET /private/users/{id}`.

## Dependencies
**Depends on:** [step-01](./step-01-user-admin-scope.md) (agreed scope + schema), [01 step-02](../01-admin-auth-rbac-cors/step-02-private-middleware-rbac.md) (gate). Interlocks with [02](../02-credential-session-hardening/README.md) (revocation).
**Blocks:** [step-03](./step-03-user-admin-swagger-and-tests.md).

## Implementation notes
- **Role/disable changes must invalidate sessions to be meaningful.** This is the concrete link to [02](../02-credential-session-hardening/README.md): reuse its revocation path. If [02](../02-credential-session-hardening/README.md) hasn't landed, at least revoke the refresh secret here and note the ≤15-min access-token window.
- The safe projection is a security control — write a test asserting `password` never appears in any admin user response.
- Counting admins on every role change is cheap (small table) and worth it for the last-admin guard.
- Keep the current `GET /private/users/{id}` behavior (used by nothing but the future UI) — changing it to the safe projection is a strict improvement.

## Acceptance criteria
- [ ] Admin can change role, toggle validation, and disable/enable users via documented endpoints, all gated + safeguarded.
- [ ] The last-admin guard prevents removing/demoting/disabling the final admin.
- [ ] Role change and disable revoke the target's session (refresh secret / version), verified by test.
- [ ] Disabled accounts cannot authenticate.
- [ ] `GET /private/users/{id}` returns the safe projection; `password` never leaks (test-proven).

## References
- `functions/private/users/[id]/index.ts` — extend with update actions.
- `libs/db/user/actions/update.ts` — `getUpdateUserAction`, `getIncrementUserVersionAction`.
- `libs/modules/user/use-cases/get-user.ts` — replace unsafe full-detail return.
- `libs/adapters/kv/auth/auth-secret-client.ts` — `deleteAuthSecret` for revocation.
- `libs/modules/user/use-cases/login.ts`, `libs/utils/jwt/credentials/get-credentials.ts` — honor `disabled` at auth.
- [02](../02-credential-session-hardening/README.md) — session revocation mechanism.
