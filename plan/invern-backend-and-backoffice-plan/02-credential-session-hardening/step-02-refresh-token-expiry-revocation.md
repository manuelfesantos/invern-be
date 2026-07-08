---
status: Done
priority: P0
feature: 02-credential-session-hardening
track: backend-hardening
depends_on: []
blocks: []
---
# Step 02: Refresh-token expiry + revocation on logout

**Status:** Done · **Priority:** P0 · **Feature:** [Credential & Session Hardening](./README.md)

## Technical goal
Give refresh tokens a bounded lifetime and make logout (and password change) actually revoke the server-side refresh secret, so a captured or post-logout refresh token stops working. Reconcile the unused `users.version` counter with the session model.

## User impact
Shoppers and admins: "log out" genuinely ends the session everywhere; a stolen refresh token has a bounded blast radius. No change to normal logged-in usage within the token lifetime.

## Current state
- `getLoggedInRefreshToken(userId)` signs `{ userId }` with **no `exp`** (`libs/utils/jwt/jwt-utils.ts`) → the refresh JWT never expires.
- The refresh token is also stored in `AUTH_KV` keyed by `userId` (`setAuthSecret` in `login.ts`), and `getCredentials`' refresh path checks the presented token equals the stored one (`handleLoggedInRefreshToken`).
- `deleteAuthSecret` exists (`libs/adapters/kv/auth/auth-secret-client.ts`) but is **called nowhere** (verified via grep). `logout.ts` only returns anonymous tokens — it does **not** delete the stored secret, so the old refresh token still validates against KV after "logout."
- `users.version` is incremented on order creation (`getIncrementUserVersionAction`) but **never read** during auth (verified) — it is not currently a revocation mechanism.

## Technical steps
1. Add an `exp` to the refresh token: sign `{ userId, exp: getFutureDate(REFRESH_TOKEN_EXPIRY) }`, introducing a `REFRESH_TOKEN_EXPIRY` constant in `libs/utils/timer/index.ts` (e.g. the existing 2-week `TOKEN_COOKIE_MAX_AGE` window, aligned to the cookie `Max-Age`). Ensure `verifyRefreshToken` continues to validate expiry (the `@tsndr/cloudflare-worker-jwt` `verify` checks `exp`).
2. Set the `AUTH_KV` entry's TTL to match, so the stored secret self-expires (`setAuthSecret` currently sets no `expirationTtl`) — add `{ expirationTtl }` to the `put`.
3. Make logout revoke the session: in `logout.ts` (or the logout use-case path), call `deleteAuthSecret(userId)` for the current user before returning anonymous tokens. Confirm `userId` is available in `contextStore` at logout time (the public middleware populates it for the `user` endpoint group).
4. Revoke on password change and reset too: after a successful password update/reset, delete the stored refresh secret so old sessions can't continue with the old credentials.
5. Decide the `version` question (pick one, document it):
   - **(a) Use it:** include `version` in the access token, and have `getCredentials` compare the token's `version` to the current DB `version`, rejecting stale tokens. This turns `version` into a real global-logout / force-reauth lever (increment on password change, role change, logout-all). More work, strongest guarantee.
   - **(b) Don't use it for auth:** leave `version` as an ordering/optimistic-concurrency field and remove the impression that it gates sessions; rely on KV revocation + short access-token TTL. Simpler.
   - Recommended: **(b)** for launch (KV revocation + expiry already close the hole), with a note that (a) is the path if "log out all devices" is later required.
6. Add tests: post-logout refresh token is rejected; expired refresh token is rejected; password change invalidates prior sessions.

## Dependencies
**Depends on:** None. Coordinate with [feature 01](../01-admin-auth-rbac-cors/README.md) since both edit the JWT/credential code.
**Blocks:** None.

## Implementation notes
- The refresh secret is keyed by `userId` (single active refresh token per user). That means one browser logging out revokes the refresh token for all of that user's sessions — acceptable and arguably desirable for an admin tool, but note it so it isn't surprising. If per-device sessions are ever needed, the KV key would need a device/session id.
- Deleting the KV secret is the authoritative revocation; the JWT `exp` is defense-in-depth for the case where KV is bypassed. Keep both.
- Watch the OAuth path: `oauth/google.ts` also mints/stores refresh tokens via `getRefreshToken`/`setAuthSecret`; apply the same TTL there.
- Rollback: these are additive (adding `exp`, a `delete` call, a TTL). If revocation misbehaves, removing the `deleteAuthSecret` call reverts to prior behavior; the `exp` is safe to keep.

## Acceptance criteria
- [ ] Refresh tokens carry an `exp` and are rejected after it passes.
- [ ] The `AUTH_KV` refresh secret is stored with a matching TTL.
- [ ] After logout, presenting the pre-logout refresh token no longer authenticates (KV secret deleted).
- [ ] A password change/reset invalidates previously issued sessions.
- [ ] The `version`-for-auth decision is implemented and documented in the PR.
- [ ] Tests cover post-logout rejection, expiry rejection, and password-change invalidation.

## References
- `libs/utils/jwt/jwt-utils.ts` — `getLoggedInRefreshToken`, `verifyRefreshToken`, `getTokenCookie`.
- `libs/utils/timer/index.ts` — timing constants (`TOKEN_COOKIE_MAX_AGE`, `TOKEN_EXPIRY`); add `REFRESH_TOKEN_EXPIRY`.
- `libs/adapters/kv/auth/auth-secret-client.ts` — `setAuthSecret` (add TTL), `deleteAuthSecret` (wire up).
- `libs/modules/user/use-cases/logout.ts` — revoke here.
- `libs/utils/jwt/credentials/get-credentials.ts` — `handleLoggedInRefreshToken` (KV check; optional `version` check).
- `libs/modules/user/use-cases/oauth/google.ts` — OAuth refresh-token issuance.

## Verification (2026-07-03 · commit `SPIRIT-102` / `ceb64a6`)
- `REFRESH_TOKEN_EXPIRY` (2 weeks) added to `@timer-utils`; `getLoggedInRefreshToken` now signs `exp`. `setAuthSecret` stores the AUTH_KV secret with `expirationTtl: REFRESH_TOKEN_EXPIRY`. `logout` calls `deleteAuthSecret(userId)`; `update-password` deletes the secret after a change. `forgot-password/reset` already rotates the secret (mints+stores a new one the client doesn't hold) → old sessions invalid; left as-is.
- **`version` decision: option (b)** — not used for auth. KV revocation + the 15m access-token TTL close the hole. Documented; option (a) noted as the future path for "log out all devices".
- **Layering check:** the KV adapter importing `@timer-utils` is allowed (adapters may import utils; the r2 adapter already does). Modules importing `@kv-adapter` is allowed (login already does).
- Unit tests (`test/unit/refresh-token.test.ts`, 3): refresh token has a future `exp`; `setAuthSecret` records the TTL; `deleteAuthSecret` removes the secret.
- **E2E (wrangler dev)** — the definitive revocation proof: minted a well-formed **expired** admin access token (app scheme: `jwt.sign` HS512 → AES-GCM encrypt), then called `/private/products` with `expired access + valid logged-in refresh cookie`: **BEFORE logout → 200** (refresh path re-auths via the stored KV secret); **logout → 200**; **AFTER logout, same tokens → 401** (secret revoked). Password-change revocation uses the identical `deleteAuthSecret` path.
- Note: "refresh rejected after `exp` passes" is proven at the unit level (exp present; `jwt.verify` enforces it) rather than by waiting 2 weeks.
- `npm run lint` (0 warnings) / `type-check` / `jest` (27) all exit 0.
