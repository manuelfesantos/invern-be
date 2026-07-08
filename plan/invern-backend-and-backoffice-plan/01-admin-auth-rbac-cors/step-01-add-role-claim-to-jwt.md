---
status: Done
priority: P0
feature: 01-admin-auth-rbac-cors
track: backend-hardening
depends_on: []
blocks: ["01-admin-auth-rbac-cors/step-02"]
---
# Step 01: Add the role claim to the access-token JWT

**Status:** Done · **Priority:** P0 · **Feature:** [Admin Authentication, RBAC & CORS](./README.md)

## Technical goal
Carry the authenticated user's `role` (`ADMIN`/`USER`) inside the signed access-token JWT and expose it on the resolved credentials, so a downstream authorization check can trust it without a database round-trip on every request.

## User impact
None directly — internal plumbing that the `/private` RBAC middleware (step 2) and the backoffice login (feature 16) build on.

## Current state
- `getLoggedInToken(userId, cartId)` signs `{ userId, cartId, exp }` only — no role (`libs/utils/jwt/jwt-utils.ts`).
- `userJwtSchema` is `{ iat, exp, userId, cartId }` (`libs/entities/jwt/jwt-entity.ts`) — no role field.
- `login.ts` calls `getLoggedInToken(userId, user.cart.id)` and returns the user; the `User` object *does* carry `role` (it comes from `baseUserSchema`), so the value is available at issue time.
- `getCredentials` (`libs/utils/jwt/credentials/get-credentials.ts`) returns a `Credentials` object with `userId`/`cartId` but no role.
- `role` exists on the row (`db/schema.ts` `usersTable.role`, default `USER`) and in `RolesEnum` (`libs/entities/user/roles.ts`) but is read nowhere.

## Technical steps
1. Extend `userJwtSchema` in `libs/entities/jwt/jwt-entity.ts` with `role: rolesSchema.optional()` (optional so existing tokens in the wild still parse during rollout; treat a missing role as `USER`).
2. Change `getLoggedInToken` to accept and sign `role`: `getLoggedInToken(userId, cartId?, role?)` → include `role` in the payload. Update `getLoggedInRefreshToken` **not** to carry role (refresh tokens stay minimal; role is re-read when a new access token is minted).
3. Update the two access-token issue sites to pass role:
   - `login.ts` → `getLoggedInToken(userId, user.cart.id, user.role)`.
   - `get-credentials.ts` `handleLoggedInRefreshToken` (which mints a fresh access token from a valid refresh token) → it already loads the user via `getSelectUserByIdAction(userId)`; pass `user.role` into `getLoggedInToken`. Confirm the selected user object includes `role` (it uses `mapUserFromSelectResult`, which spreads the full row — it does).
4. Surface `role` on the `Credentials` type (`libs/entities/request/**`) and set it in `handleLoggedInToken` / `handleLoggedInRefreshToken` in `get-credentials.ts` so callers (the future middleware) can read it. For the anonymous/logged-out branches, leave it undefined.
5. Anonymous tokens (`get-anonymous-tokens.ts`) must **not** get an `ADMIN` role — verify they carry no role or `USER`.

## Dependencies
**Depends on:** None.
**Blocks:** [step-02](./step-02-private-middleware-rbac.md) (the middleware reads this claim).

## Implementation notes
- Keep the role **optional** in the schema for one deploy cycle; a hard-required field would reject every access token issued before this change and force mass re-login. Default absent → `USER` at the authorization check.
- Do not put role in the *refresh* token. If it were there, demoting an admin wouldn't take effect until the refresh token itself expired; re-reading role at access-token mint time (≤15 min, `TOKEN_EXPIRY`) is the tighter bound.
- The access token is AES-GCM-encrypted then signed (`signJwt` wraps `jwt.sign` in `encrypt`), so the role is not readable client-side — fine, the backoffice learns role from the login response body, not by decoding the token.
- Security check: ensure no public route copies `role` from a client-supplied header/body into the token. Role must only ever come from the DB row.

## Acceptance criteria
- [ ] A freshly issued access token, when decoded server-side, contains `role` matching the user's DB row.
- [ ] `getCredentials` returns `role` for a logged-in caller and `undefined`/`USER` for anonymous callers.
- [ ] Access tokens minted via the refresh-token path also carry the correct current role.
- [ ] `tsc --noEmit` passes; existing auth flows (login, refresh, logout) still work.
- [ ] A unit test asserts an `ADMIN` user's issued token decodes with `role === "ADMIN"`.

## References
- `libs/utils/jwt/jwt-utils.ts` — `signJwt`, `getLoggedInToken`, `getLoggedInRefreshToken`, `decodeJwt`.
- `libs/entities/jwt/jwt-entity.ts` — `userJwtSchema`.
- `libs/utils/jwt/credentials/get-credentials.ts` — `handleLoggedInToken`, `handleLoggedInRefreshToken`.
- `libs/modules/user/use-cases/login.ts` — access-token issue site.
- `libs/entities/user/roles.ts` — `rolesSchema` / `RolesEnum`.

## Verification (2026-07-03 · commit `SPIRIT-101` / `0a3c306`)
- `userJwtSchema` gained optional `role`; `getLoggedInToken(userId, cartId?, role?)` signs it; refresh token left role-less. `login.ts` and `get-credentials.ts` `handleLoggedInRefreshToken` pass `user.role`; both logged-in credential branches surface `role` (anonymous branches leave it undefined). `Role` type added to `roles.ts`, used by `Credentials`.
- **Decision (per plan notes):** other logged-in mint sites (`logged-in-response.ts`, signup `validate-user.ts`, oauth callback) left role-less — they issue USER-context tokens for storefront/new-user/oauth flows, not admin. The robustness case (an admin holding a role-less token) is handled by a DB role-lookup fallback added in step-02's middleware. Recorded here so it isn't mistaken for an omission.
- Unit test `test/unit/jwt-role.test.ts`: `getLoggedInToken` → `decodeJwt` round-trips role (ADMIN, USER, and absent→undefined).
- **End-to-end** against `wrangler pages dev` (port 8799, local D1): seeded a validated ADMIN (`admin@invern.local`) + USER (`user@invern.local`) directly in D1 with correctly-computed password hashes (`SHA-256(pw+SALT+id)`). Flow: `GET /config` → anonymous tokens → `POST /public/countries/PT/user/login` → **200**. Decrypted the server-issued access token (AES-GCM via the app's scheme) → payload `{"userId":"fdfe5a21…","role":"ADMIN",…}`. Wrong password → **401** "Invalid username or password". (Note: `/user/*` is a protected endpoint, so login requires anonymous tokens present first — the storefront obtains them from `/config`.)
- `npm run lint` / `type-check` / `jest` → all exit 0 (5 suites, 13 tests).
- Seed users kept for step-02 RBAC verification.
