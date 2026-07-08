---
status: Not Started
priority: P1
feature: 12-user-admin-actions
track: backend-api-completion
depends_on: ["12-user-admin-actions/step-02"]
blocks: []
---
# Step 03: User admin swagger + tests

**Status:** Not Started · **Priority:** P1 · **Feature:** [User Admin Actions](./README.md)

## Technical goal
Document the admin user endpoints in `swagger.yaml` and add tests for the safeguards (last-admin guard, session revocation on role/disable change), the safe projection (no password leak), and disabled-account auth rejection.

## User impact
None directly; contract accuracy for the typed client and regression protection for the most privilege-sensitive endpoints in the system.

## Current state
- `swagger.yaml` documents `/private/users` list and `/private/users/{id}` detail/delete, without the update actions or the safe projection.
- No tests for user admin behavior.

## Technical steps
1. Swagger: document the update endpoints (role/validation/disable, per step-02's chosen shape), the safe `adminUserSchema` response for detail/list, and keep delete. Note the safeguards in descriptions.
2. Tests (per [04](../04-testing-quality-gates/README.md)):
   - Role change succeeds for an admin; **last-admin guard** blocks demoting/deleting/disabling the final admin.
   - Role change / disable **revokes the target's session** (assert the `AUTH_KV` secret is deleted / version bumped via the KV fake).
   - Disabled account cannot log in / resolve credentials.
   - `password` never appears in any admin user response (list or detail).
   - Validation toggle updates `isValidated`.
   - Auth: anonymous/USER rejected from the admin user routes.
3. Confirm spec-freshness CI passes.

## Dependencies
**Depends on:** [step-02](./step-02-user-admin-endpoints.md).
**Blocks:** None. Feeds [14](../14-api-contract-typed-client/README.md).

## Implementation notes
- The **last-admin guard** and **no-password-leak** tests are the critical ones — they encode the two properties that make this feature safe. Don't ship without them green.
- Session-revocation tests depend on the KV fake ([04 step-01](../04-testing-quality-gates/step-01-jest-scaffolding-and-fakes.md)); assert the fake's state after the action.

## Acceptance criteria
- [ ] Admin user endpoints documented in `swagger.yaml` with the safe projection.
- [ ] Tests cover last-admin guard, session revocation on role/disable, disabled-auth rejection, no-password-leak, and validation toggle.
- [ ] One auth-rejection test included.
- [ ] Spec-freshness CI passes.

## References
- `swagger.yaml` — user admin paths.
- [step-02](./step-02-user-admin-endpoints.md) — behavior under test.
- [04 step-01](../04-testing-quality-gates/step-01-jest-scaffolding-and-fakes.md) — KV fake for revocation assertions.
- [14](../14-api-contract-typed-client/README.md) — spec/client sync.
