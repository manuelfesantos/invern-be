# 12 — User Admin Actions

**Status:** Not Started · **Priority:** P1 · **Track:** Backend API Completion

## Summary
Admin user management is nearly read-only: `/private/users` lists (paginated) and `/private/users/{id}` returns detail — and, contrary to the brief's "read-only" description, also exposes a working `onRequestDelete` that hard-deletes a user. There is **no update path**: no way to change a user's `role` (the very thing RBAC in [01](../01-admin-auth-rbac-cors/README.md) depends on), mark a user validated, or disable/enable an account. This feature defines the admin user-management scope as an explicit product decision and implements the chosen actions, most importantly role management — which is how the first and subsequent `ADMIN`s get created once RBAC is enforced.

## Why this matters
Once [01](../01-admin-auth-rbac-cors/README.md) enforces `ADMIN`-only access, promoting a user to `ADMIN` becomes an operational necessity — and today it requires a direct `wrangler d1 execute` (documented as the bootstrap escape hatch in [06 step-04](../06-observability-ops-readiness/step-04-ops-runbook.md)). A backoffice that "controls the whole backend" needs, at minimum, to manage roles and validation state from the UI, not the CLI. Support also needs to help customers (resend validation, disable a compromised account) without engineering.

## Product decision required (open question 4 in the root README)
How much power should the backoffice have over accounts? This plan proposes: **role change, mark-validated, and disable/enable (soft), with hard-delete retained but guarded.** Confirm the exact set before building — it's the scope of both this feature and the UI in [21](../21-backoffice-users/README.md).

## Goals — what "done" looks like
- A defined, documented set of admin user actions (role, validation, enable/disable, delete) — agreed with the user.
- Endpoints implementing that set, admin-gated, with the safeguards those sensitive actions require (can't demote the last admin, confirm destructive actions, etc.).
- Full user detail exposes what staff need without leaking secrets (never the password hash).
- Role changes interoperate correctly with the JWT role claim ([01](../01-admin-auth-rbac-cors/README.md)) and session revocation ([02](../02-credential-session-hardening/README.md)).
- Swagger + tests.

## User / business impact
Admin staff: manage users (create admins, help customers) from the UI. Shoppers: support can resolve account issues faster; a "disabled" state protects compromised accounts. Security: role changes are the controlled path to admin access.

## In scope / Out of scope
**In scope:** admin user detail (full, safe); role update; validation toggle; account disable/enable; guarded delete; interplay with RBAC/session revocation; swagger; tests.
**Out of scope:** an admin-invite-by-email flow with new templates (deferred — see root README); shopper self-service account changes (already exist under `/public`); the backoffice user UI ([21](../21-backoffice-users/README.md)).

## Dependencies
**Depends on:** [01](../01-admin-auth-rbac-cors/README.md) (role claim + gate; role changes must propagate), [02](../02-credential-session-hardening/README.md) (session revocation on disable/role change), [07](../07-pagination-filtering-envelope/README.md) (list envelope/filter). Tests per [04](../04-testing-quality-gates/README.md).
**Blocks:** [21 — User/Customer Management UI](../21-backoffice-users/README.md); reflected in [14](../14-api-contract-typed-client/README.md).

## Steps
| # | Step | Priority | Status | Depends on |
|---|---|---|---|---|
| 01 | [Define admin user-management scope & safeguards](./step-01-user-admin-scope.md) | P1 | Not Started | — |
| 02 | [Implement user admin update endpoints](./step-02-user-admin-endpoints.md) | P1 | Not Started | step-01, 01-admin-auth-rbac-cors/step-02 |
| 03 | [User admin swagger + tests](./step-03-user-admin-swagger-and-tests.md) | P1 | Not Started | step-02 |

## Key risks
- **Privilege escalation / lockout.** Role change is the most sensitive action in the whole system. Guardrails are mandatory: prevent removing the last admin, require the actor to be an admin (RBAC handles that), and consider confirmation for self-demotion.
- **Leaking secrets in "full detail."** The user row holds the password hash and Google id; admin detail must use a safe projection (never return `password`).
- **Disable semantics.** There's no `disabled` column today — disabling likely needs a schema change and must be honored at login/credential resolution, or it's cosmetic.

## Relevant existing code
- `functions/private/users/index.ts` — paginated list (`getAllUsers`).
- `functions/private/users/[id]/index.ts` — detail (`getUser(id, false)`) + **working delete** (`deleteUser`).
- `libs/modules/user/use-cases/get-user.ts` — `getUser` (has a `shouldDTO=false` full form; note it returns the whole `User` incl. password — needs a safe admin projection).
- `libs/modules/user/use-cases/delete-user.ts` — hard delete (also deletes cart).
- `libs/db/user/actions/update.ts` — `getUpdateUserAction`, `getIncrementUserVersionAction` (role/validation writes; version bump for session invalidation).
- `libs/entities/user/user-entity.ts` — `baseUserSchema`, `userDTOSchema` (DTO omits password/role — admin needs a different, role-including-but-password-excluding projection), `UserValidationStatusEnum`.
- `libs/entities/user/roles.ts` — `RolesEnum`.
- `db/schema.ts` — `usersTable` (`role`, `isValidated`, `version`; **no `disabled` column** — would need adding).
