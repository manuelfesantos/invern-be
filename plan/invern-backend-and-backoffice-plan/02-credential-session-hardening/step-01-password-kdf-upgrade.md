---
status: Done
priority: P0
feature: 02-credential-session-hardening
track: backend-hardening
depends_on: ["04-testing-quality-gates/step-01"]
blocks: []
---
# Step 01: Upgrade password hashing to a real KDF (with migration)

**Status:** Done · **Priority:** P0 · **Feature:** [Credential & Session Hardening](./README.md)

## Technical goal
Replace single-round SHA-256 password hashing with a purpose-built, high-cost, salted KDF available in the Workers runtime (PBKDF2 via Web Crypto is the pragmatic choice), and migrate existing hashes transparently on next successful login so no user is locked out.

## User impact
Shoppers and admins: their stored password hashes become resistant to offline brute force. The only visible effect is a one-time, invisible re-hash the next time they log in successfully.

## Current state
- `hashPassword(password, id)` returns `hashString(`${password}${SALT}${id}`)`, and `hashString` is a single `crypto.subtle.digest("SHA-256", ...)` (`libs/utils/crypto/hash.ts`). Fast, unsalted-per-user beyond the global `SALT`+`userId`, and not a KDF.
- `login.ts` `validatePassword` computes `hashPassword(text, user.id)` and string-compares to `user.password`.
- `users.password` is `text` and nullable (OAuth users have none) — `db/schema.ts`.
- `hashString` is also used for non-password data (e.g. hashing the Google user id in `oauth/google.ts`) — **do not** change `hashString`'s behavior for those callers; only the password path should move to the KDF.

## Technical steps
1. Add a new password module (e.g. `libs/utils/crypto/password.ts`) with `hashPassword(password, salt?)` and `verifyPassword(password, storedValue)` using **PBKDF2-HMAC-SHA-256** via `crypto.subtle` (import key → deriveBits) with a high iteration count (choose per current OWASP guidance, e.g. ≥600k for PBKDF2-SHA-256) and a per-user random salt.
2. Store hashes in a self-describing format that encodes algorithm + params + salt, e.g. `pbkdf2$sha256$<iterations>$<base64 salt>$<base64 hash>`. This lets `verifyPassword` detect legacy vs new and lets you raise the cost later without another migration.
3. Make `verifyPassword` recognize the **legacy** format (a bare 64-hex SHA-256 string) and verify it with the old `hashPassword(password, userId)` logic, so existing users still log in.
4. On a successful login where the stored hash is legacy (or uses outdated params), re-hash the submitted plaintext with the new KDF and update `users.password` (rehash-on-login). Do this inside the existing login flow (`login.ts`), reusing the update-user action.
5. Point signup, password-reset (`forgot-password/reset.ts`), and email/password update flows at the new `hashPassword`. Audit every writer of `users.password` and switch them.
6. Keep the global `SALT` env var meaning documented; the new scheme uses a per-user random salt embedded in the stored value, so `SALT` is no longer load-bearing for passwords (note this in [05](../05-configuration-data-hygiene/README.md) rather than removing it blindly — other code may read it).

## Dependencies
**Depends on:** None (but write tests per [04](../04-testing-quality-gates/README.md)).
**Blocks:** None. Should precede real customer signups.

## Implementation notes
- **PBKDF2 is chosen for runtime compatibility.** bcrypt/scrypt/Argon2 aren't natively in the Workers Web Crypto surface; a pure-JS Argon2/bcrypt adds bundle weight and CPU-time risk within Worker limits. PBKDF2 via `crypto.subtle.deriveBits` is native and sufficient when iteration count is high. If a vetted scrypt/Argon2 WASM within CPU limits is preferred, the self-describing format makes that swap a param change, not a rewrite.
- **Mind Worker CPU limits.** Very high iteration counts cost CPU per login; validate the chosen count stays within the Worker CPU-time budget under expected login concurrency. Tune down only as far as guidance allows.
- **Never invalidate existing hashes.** The legacy-verify path is mandatory. Test it explicitly with a hash produced by the *current* `hashPassword` before you change anything.
- **Timing:** use a constant-time comparison for the final hash check (`crypto.subtle` digest compare via a constant-time equal, not `===` on hex strings where feasible). The current code uses `!==`; at minimum keep behavior no worse and prefer constant-time.
- Migration is lazy by design (no forced global reset) — see open question 5 in the root README; confirm no stakeholder wants a forced reset instead.

## Acceptance criteria
- [ ] New signups store a `pbkdf2$...` self-describing hash with a per-user random salt.
- [ ] A user whose stored hash is the legacy SHA-256 format can still log in, and their hash is transparently upgraded to the new format on that login.
- [ ] `hashString` (non-password uses, e.g. Google id hashing) is unchanged.
- [ ] Password reset and email/password update write new-format hashes.
- [ ] Unit tests cover: new-hash round-trip, legacy-verify, rehash-on-login, and wrong-password rejection.

## References
- `libs/utils/crypto/hash.ts` — `hashPassword`, `hashString` (legacy).
- `libs/modules/user/use-cases/login.ts` — `validatePassword`, login flow (rehash-on-login site).
- `libs/modules/user/use-cases/forgot-password/reset.ts` — password reset writer.
- `libs/modules/user/use-cases/update-user/password/index.ts` — password update writer.
- `libs/modules/user/use-cases/oauth/google.ts` — uses `hashString` for the Google id (must stay on the old helper).
- `libs/db/user/actions/update.ts` — `getUpdateUserAction` for persisting the rehash.

## Verification (2026-07-03 · commit `SPIRIT-102` / `cb81848`)
- Added `libs/utils/crypto/password.ts`: `hashPassword(password)` (PBKDF2-HMAC-SHA256, 600k iterations, per-user 16-byte random salt, self-describing `pbkdf2$sha256$<iter>$<b64salt>$<b64hash>`) and `verifyPassword(password, stored, userId)` → `{ valid, needsRehash }` with constant-time compare. Legacy detection: bare 64-hex = old `SHA-256(password+SALT+userId)`; verified via `hashString` and flagged `needsRehash`.
- **Architecture note (not in the step, discovered):** the DB `insert`/`update` user actions auto-hash the `password` field in their preprocessors — so those are the *writers* (signup/reset/update all flow through them), and `login`/`update-password` are the *verifiers*. Switched writers to `hashPassword(password)` (dropped the old `userId` arg) and verifiers to `verifyPassword`. Removed old `hashPassword` from `hash.ts` (kept `hashString` for the Google-id use, unchanged).
- Rehash-on-login: `login.ts` `validatePassword` calls `verifyPassword`; on `needsRehash` it re-writes the plaintext via `getUpdateUserAction` (which re-hashes with the new KDF). OAuth/null-password accounts rejected explicitly.
- **Migration = lazy** (no forced reset), the plan's default; appropriate pre-launch. Confirmed acceptable (open question 5 default taken; user did not request a forced reset).
- **SALT retained** — still used by the legacy-verify path + `hashString` (oauth). Its password role is now deprecated; to be documented (not removed) in feature 05's env work.
- **CPU:** single 600k derive ≈ **47ms** (measured). Fine on Cloudflare paid/standard CPU allowance; would exceed a 10ms free-tier limit. Tunable via the stored `iterations` param without a migration. Documented in the module.
- Tests: `test/unit/password.test.ts` (7) — pbkdf2 format, random-salt non-determinism, correct/wrong verify, legacy-verify + `needsRehash`, upgraded-then-verifies-without-rehash, malformed-hash rejection. Updated the earlier `hash.test.ts` smoke (no longer 2-arg). 24 tests total.
- **E2E** (wrangler dev, seeded ADMIN with a real legacy 64-hex hash): `login admin1234` → **200**, stored hash upgraded `f53d2eba…`(len 64) → `pbkdf2$…`(len 90); 2nd login → **200** (no re-rehash); wrong password → **401**. New-format writes confirmed via the shared insert/update path.
- `npm run lint` (0 warnings) / `type-check` / `jest` all exit 0.
