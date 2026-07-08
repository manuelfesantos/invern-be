# 01 — Admin Authentication, RBAC & CORS

**Status:** Done · **Priority:** P0 · **Track:** Backend Hardening (also satisfies the backoffice's admin-auth dependency, brief §11 #6)

## Summary
Today **every** `/private/*` route is completely unauthenticated — there is no `functions/private/_middleware.ts` and no handler performs an auth check (verified in `functions/private/products/index.ts`, `functions/private/users/[id]/index.ts`, etc.). The only "protected" private routes are `/private/insert-test-data` and `/private/stock/setup`, which compare a `secretKey` body field to an env var. The `users.role` enum (`ADMIN`/`USER`) is defined in the schema but read nowhere, and the JWT carries no role claim. This feature adds a real authentication + `ADMIN`-authorization layer over all admin routes, puts the role into the token, and establishes a deliberate CORS policy that serves both the storefront and the new backoffice origin.

## Why this matters
Anyone on the internet can currently create/update/delete products, currencies, countries, collections and orders, and read all carts and users, by calling `/private/*` directly. This is a launch-blocking security hole on its own. It is *also* the single hard prerequisite for the backoffice: there can be no real "admin login" until the backend can authenticate a request and prove the caller is an `ADMIN`.

## Goals — what "done" looks like
- Every `/private/*` route (except the intentionally public webhooks under `/stripe/*`, which are separate) rejects unauthenticated and non-admin callers with `401`/`403` before any business logic runs.
- The access-token JWT carries the user's `role`, and login/refresh flows populate it.
- Authorization is enforced in one shared place (a `/private` middleware), not copy-pasted per route.
- The two legacy shared-secret routes (`insert-test-data`, `stock/setup`) are reconciled with the new model (kept as secret-gated maintenance endpoints, or folded into RBAC — decided in step 2).
- CORS is driven by an explicit allow-list of origins per environment, covering the storefront **and** the backoffice, applied consistently (not only when `ENV === "local"`).
- `swagger.yaml` describes the real auth scheme, and there are tests proving an anonymous and a `USER`-role caller are both rejected from a representative `/private/*` route.

## User / business impact
Shoppers: none (public routes unchanged). Admin/backoffice staff: this is what makes a secure admin login possible. On-call/security: closes a critical unauthenticated-write hole before launch.

## In scope / Out of scope
**In scope:** `/private/*` authn+authz middleware; role claim in JWT; login/refresh role propagation; CORS policy for both frontends; reconciling the two secret-gated routes; swagger + tests for the auth behavior.
**Out of scope:** password hashing, refresh-token lifecycle/revocation, IV reuse and rate limiting (all in feature 02); the backoffice-side login UI (feature 16).

## Dependencies
**Depends on:** [04 — Testing & Quality Gates](../04-testing-quality-gates/README.md) `step-01` (Jest must run so the new auth behavior can be tested).
**Blocks:** [16 — Auth & Application Shell](../16-backoffice-auth-shell/README.md) (backoffice login), and the safety of the entire Track B admin surface.

## Steps
| # | Step | Priority | Status | Depends on |
|---|---|---|---|---|
| 01 | [Add the role claim to the access-token JWT](./step-01-add-role-claim-to-jwt.md) | P0 | Done | — |
| 02 | [`/private` authentication + RBAC middleware](./step-02-private-middleware-rbac.md) | P0 | Done | step-01 |
| 03 | [Deliberate CORS policy for both frontends](./step-03-cors-policy-two-origins.md) | P0 | Done | — |
| 04 | [Auth swagger scheme + rejection tests](./step-04-admin-auth-tests-and-swagger.md) | P0 | Done | step-02, 04-testing-quality-gates/step-01 |

## Key risks
- **Locking out the maintenance/cron routes.** `/private/expired/*` are almost certainly hit by a Cloudflare Cron trigger or an internal caller, not an admin browser. Enumerate every current caller of each `/private/*` route (cron, webhooks, the storefront) before turning on the gate, or a scheduled job silently starts 401ing. Mitigation: step 2 explicitly classifies each route as *admin-interactive* vs *machine/maintenance* and gives the machine ones a service-auth path.
- **JWT size / claim trust.** Putting `role` in the signed access token means a role change only takes effect on the next token issuance (≤15 min access-token TTL). Acceptable, but document it so a "demote admin" action isn't assumed to be instant.

## Relevant existing code
- `functions/_middleware.ts` — global middleware (logger + env); where the local-only CORS lives today.
- `functions/private/**` — all admin routes; **no `_middleware.ts` here currently**.
- `libs/utils/jwt/jwt-utils.ts` — `signJwt`/`getLoggedInToken` (add `role`); `decodeJwt`.
- `libs/entities/jwt/jwt-entity.ts` — `userJwtSchema` (extend with `role`).
- `libs/utils/jwt/credentials/get-credentials.ts` — where a logged-in user's identity is resolved; the natural place to surface `role`.
- `libs/entities/user/roles.ts` — `RolesEnum` (`ADMIN`/`USER`).
- `functions/private/stock/[productId]/index.ts` — the one route that manually sets `Access-Control-Allow-Origin: ENV.FRONTEND_HOST`.
- `libs/modules/user/use-cases/login.ts` — issues the access token on login.
