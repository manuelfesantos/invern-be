# 21 — User / Customer Management UI

**Status:** Not Started · **Priority:** P1 · **Track:** Backoffice App

## Summary
The backoffice screens for users: a paginated/filterable user list, a full (safe) user detail view, and the admin actions defined by feature [12](../12-user-admin-actions/README.md) — role change, validation toggle, disable/enable, and guarded delete. Scope is exactly whatever [12](../12-user-admin-actions/README.md)'s product decision settled on.

## Why this matters
Managing users — especially promoting the admins the whole backoffice depends on, and helping customers (resend validation, disable a compromised account) — is core operational tooling. It's the UI counterpart to the most privilege-sensitive backend feature, so it must present those actions with the right guardrails.

## Goals — what "done" looks like
- User list: paginated, filterable (by role, validation status, email), never exposing secrets.
- User detail: safe full view (no password/hash), with cart/order summary.
- Admin actions matching [12](../12-user-admin-actions/README.md): role change, mark-validated, disable/enable, delete — each with the appropriate confirmation and guardrails (last-admin protection surfaced clearly).
- Session-invalidation side effects (role/disable) are communicated to the operator.

## User / business impact
Admin staff: manage accounts and create admins from the UI. Shoppers: faster support resolution; compromised accounts can be disabled. Security: role changes happen through a guarded UI, not the CLI.

## In scope / Out of scope
**In scope:** user list, safe detail, and the [12](../12-user-admin-actions/README.md)-defined admin actions.
**Out of scope:** admin-invite-by-email flow (deferred); shopper self-service (exists under `/public`); the backend user-admin API ([12](../12-user-admin-actions/README.md)).

## Dependencies
**Depends on:** [16](../16-backoffice-auth-shell/README.md), [17](../17-backoffice-design-system/README.md), [07](../07-pagination-filtering-envelope/README.md), [12](../12-user-admin-actions/README.md) (the API + agreed scope).
**Blocks:** None.

## Steps
| # | Step | Priority | Status | Depends on |
|---|---|---|---|---|
| 01 | [Users list & detail](./step-01-users-list-and-detail.md) | P1 | Not Started | 16-backoffice-auth-shell/step-03, 17-backoffice-design-system/step-02, 12-user-admin-actions/step-02 |
| 02 | [User admin actions UI](./step-02-user-admin-actions-ui.md) | P1 | Not Started | step-01, 12-user-admin-actions/step-02 |

## Key risks
- **Presenting dangerous actions safely.** Role change and delete are high-impact; the UI must confirm clearly, surface the last-admin guard, and never imply an instant effect it can't deliver (role changes propagate on next token issuance).
- **Leaking secrets.** The detail view must use the safe projection ([12 step-02](../12-user-admin-actions/step-02-user-admin-endpoints.md)); never render password/hash even if the API ever returns extra fields.

## Relevant existing code / references
- `apps/backend/src/routes/private/users.ts` — list/detail + the new admin update actions ([12](../12-user-admin-actions/README.md)).
- `libs/entities/user/user-entity.ts` — the safe `adminUserSchema` projection ([12 step-01](../12-user-admin-actions/step-01-user-admin-scope.md)).
- [12](../12-user-admin-actions/README.md) — the agreed scope + safeguards this UI presents.
