# 02 — Credential & Session Hardening

**Status:** Done · **Priority:** P0 · **Track:** Backend Hardening

## Summary
The authentication *primitives* have several concrete weaknesses independent of the authorization gap in feature 01. Passwords are hashed with a single round of SHA-256 (not a password KDF). Refresh tokens never expire and are never revoked on logout (`deleteAuthSecret` is dead code). The `users.version` counter that looks like a token-invalidation lever is never checked during auth. AES-GCM encryption (used for JWTs and stored addresses) reuses a fixed IV. And there is no rate limiting anywhere. This feature fixes the credential and session layer so that stolen or brute-forced credentials, replayed refresh tokens, and nonce reuse stop being viable attacks before launch.

## Why this matters
These are the failure modes that turn a single leaked credential or database dump into account takeover at scale. A fast hash lets an attacker brute-force a stolen `users.password` column offline. A non-expiring, non-revocable refresh token means "log out" is cosmetic. Fixed-IV GCM undermines the confidentiality/integrity guarantees the whole token scheme leans on. None of these are visible in normal use, which is exactly why they must be fixed deliberately before real customer data exists.

## Goals — what "done" looks like
- Passwords are stored with a purpose-built, salted, high-cost KDF; existing SHA-256 hashes are migrated without forcing a mass reset.
- Refresh tokens carry an expiry and are revoked server-side on logout (and on password change).
- The `users.version` mechanism either actually gates token validity or is documented/removed so it isn't mistaken for security it doesn't provide.
- AES-GCM no longer reuses a fixed IV; each ciphertext uses a fresh random nonce, with backward-compatible decryption of existing data.
- Login and other credential endpoints (`forgot-password`, `resend-email`) are rate-limited/lockout-protected.
- Each change has tests, and none breaks the existing login/refresh/logout/OAuth flows.

## User / business impact
Shoppers: stronger protection of their accounts and personal data; the only visible change is a possible one-time transparent re-hash on next login. Admin staff: the same protections apply to the `ADMIN` accounts the backoffice depends on. On-call/security: materially reduces account-takeover and credential-stuffing risk.

## In scope / Out of scope
**In scope:** password KDF + migration; refresh-token expiry + revocation; `version` reconciliation; AES-GCM IV fix; rate limiting on credential endpoints.
**Out of scope:** the `/private/*` authorization gate and role claim (feature 01); PII-redaction/logging review (feature 06); MFA/passkeys (net-new customer feature, not planned).

## Dependencies
**Depends on:** [04 — Testing & Quality Gates](../04-testing-quality-gates/README.md) `step-01` (tests for the security-critical changes).
**Blocks:** Nothing structurally, but should land before launch and before real accounts exist. Coordinates with feature 01 (both touch the JWT/credential path).

## Steps
| # | Step | Priority | Status | Depends on |
|---|---|---|---|---|
| 01 | [Upgrade password hashing to a real KDF (with migration)](./step-01-password-kdf-upgrade.md) | P0 | Done | — |
| 02 | [Refresh-token expiry + revocation on logout](./step-02-refresh-token-expiry-revocation.md) | P0 | Done | — |
| 03 | [Stop AES-GCM fixed-IV reuse](./step-03-encryption-iv-per-message.md) | P0 | Done | — |
| 04 | [Rate limiting on credential endpoints](./step-04-login-rate-limiting.md) | P1 | Done | — |

## Key risks
- **Migrations that lock out real users.** Both the password KDF (step 1) and the IV change (step 3) touch data already written with the old scheme. Each must decrypt/verify old-format data transparently. Never ship a change that invalidates existing hashes or ciphertext without a read-compatible path.
- **Double-touching the JWT path with feature 01.** Both features edit `jwt-utils.ts` / credential resolution. Sequence or rebase carefully to avoid conflicting edits; ideally land feature 01's role claim first, then feature 02's expiry/revocation.

## Relevant existing code
- `libs/utils/crypto/hash.ts` — `hashPassword` (single SHA-256 over `password+salt+id`), `hashString`.
- `libs/modules/user/use-cases/login.ts` — `validatePassword` compares `hashPassword(text, id)` to stored hash.
- `libs/utils/jwt/jwt-utils.ts` — `getLoggedInRefreshToken` (no `exp`), `getTokenCookie`.
- `libs/adapters/kv/auth/auth-secret-client.ts` — `getAuthSecret`/`setAuthSecret`/`deleteAuthSecret` (**deleteAuthSecret is never called**).
- `libs/modules/user/use-cases/logout.ts` — issues anonymous tokens but does not revoke the stored refresh secret.
- `libs/utils/jwt/credentials/get-credentials.ts` — refresh-token validation against `AUTH_KV`; where `version` could be checked.
- `libs/utils/crypto/encrypt/encryptor.ts` — `encrypt`/`decrypt` default to `ENV.DEFAULT_IV` (fixed nonce).
- `libs/db/user/actions/update.ts` — `getIncrementUserVersionAction`, `version` handling.
- `libs/adapters/kv/**` — KV client patterns to reuse for a rate-limit store.
