---
status: Not Started
priority: P1
feature: 21-backoffice-users
track: backoffice-app
depends_on: ["21-backoffice-users/step-01", "12-user-admin-actions/step-02"]
blocks: []
---
# Step 02: User admin actions UI

**Status:** Not Started · **Priority:** P1 · **Feature:** [User / Customer Management UI](./README.md)

## Technical goal
Add the admin actions from feature [12](../12-user-admin-actions/README.md) to the user detail — role change, validation toggle, disable/enable, delete — each with correct confirmation, guardrails surfaced, and honest feedback about side effects.

## User impact
Admin staff perform account management (create admins, help/secure customers) safely from the UI.

## Current state
- Backend provides the agreed actions with safeguards ([12 step-02](../12-user-admin-actions/step-02-user-admin-endpoints.md)): last-admin guard, session revocation on role/disable, disabled accounts blocked at login, safe projection.

## Technical steps
1. Role change: a control to promote/demote; **surface the last-admin guard** (disable/explain the action when it would remove the final admin, matching the backend's rejection). Communicate that the change takes effect on the user's next token issuance and that it revokes their session.
2. Validation toggle: mark validated/unvalidated (e.g. to unblock a customer).
3. Disable/enable (if [12 step-01](../12-user-admin-actions/step-01-user-admin-scope.md) added it): a clearly-labeled toggle; explain it revokes the session and blocks login.
4. Delete: a strongly-confirmed destructive action (extra confirmation), surfacing the order-cascade decision from [12 step-01](../12-user-admin-actions/step-01-user-admin-scope.md) (retain vs restrict). Prefer steering staff to disable over delete where appropriate.
5. Feedback + refresh: on each action, show a clear success/failure toast and invalidate the user query; handle the backend's guard rejections (e.g. last-admin) with the exact reason.
6. Self-action care: if an admin acts on their own account (demote/disable), warn strongly (they may lock themselves out, subject to the last-admin guard).

## Dependencies
**Depends on:** [step-01](./step-01-users-list-and-detail.md), [12 step-02](../12-user-admin-actions/step-02-user-admin-endpoints.md).
**Blocks:** None.

## Implementation notes
- **Guardrails are UX, but the backend is the enforcer** — surface the last-admin guard in the UI (don't offer the action, or explain the rejection) but rely on the API to actually prevent it.
- Be honest about **timing**: role changes propagate on the next access-token issuance (≤15 min) unless the session is revoked (which [12](../12-user-admin-actions/README.md) does); tell the operator what to expect rather than implying instant global effect.
- Delete is the most dangerous action here — extra friction (type-to-confirm or a distinct confirm) is appropriate, and steering toward disable is often better.
- These are exactly the "destructive actions" the brief (§14) wants meaningfully handled and (via [12 step-03](../12-user-admin-actions/step-03-user-admin-swagger-and-tests.md)) tested; consider an E2E test of role-change in [24 step-03](../24-backoffice-deployment/step-03-e2e-smoke-and-release-runbook.md).

## Acceptance criteria
- [ ] Role change, validation toggle, disable/enable, and delete are available per the [12](../12-user-admin-actions/README.md) scope, each confirmed appropriately.
- [ ] The last-admin guard is surfaced (action prevented/explained), matching the backend.
- [ ] Side effects (session revocation, propagation timing) are communicated to the operator.
- [ ] Delete has extra friction; disable is offered as the softer option.
- [ ] Guard rejections show the exact reason; actions refresh the user data.

## References
- [12 step-01](../12-user-admin-actions/step-01-user-admin-scope.md), [12 step-02](../12-user-admin-actions/step-02-user-admin-endpoints.md) — the actions + safeguards.
- [17 step-01](../17-backoffice-design-system/step-01-owned-component-primitives.md) — confirm-dialog primitive.
- [24 step-03](../24-backoffice-deployment/step-03-e2e-smoke-and-release-runbook.md) — E2E coverage of a destructive flow.
