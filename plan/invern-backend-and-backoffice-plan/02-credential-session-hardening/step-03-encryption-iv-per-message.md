---
status: Done
priority: P0
feature: 02-credential-session-hardening
track: backend-hardening
depends_on: []
blocks: []
---
# Step 03: Stop AES-GCM fixed-IV reuse

**Status:** Done · **Priority:** P0 · **Feature:** [Credential & Session Hardening](./README.md)

## Technical goal
Stop encrypting with a fixed, reused IV. Generate a fresh random 12-byte nonce per AES-GCM encryption and store it alongside the ciphertext, while keeping a backward-compatible decrypt path for data already written with the fixed IV.

## User impact
None visible. This removes a cryptographic weakness affecting every encrypted value (JWTs, stored addresses, shipping-method ids), protecting confidentiality/integrity of that data.

## Current state
- `encrypt(data, iv?)` and `decrypt(encryptedDataBase64, iv?)` default to `getDefaultIV()` → `ENV.DEFAULT_IV` (or a hardcoded fallback `"L6zT8dEo4R1gVb"`) when no IV is passed (`libs/utils/crypto/encrypt/encryptor.ts`).
- Every caller uses the default (no caller passes an explicit IV), so **all** AES-GCM ciphertext uses the same nonce.
- What flows through this: `signJwt`/`decodeJwt` encrypt/decrypt the JWT (`jwt-utils.ts`), addresses (`decryptObjectString<Address>` in checkout and user select), and encrypted shipping-method ids. Reusing a GCM nonce across many messages under the same key breaks GCM's security guarantees (enables authentication-tag forgery / keystream reuse).

## Technical steps
1. Change `encrypt` to generate a random 12-byte IV (`crypto.getRandomValues(new Uint8Array(12))`) per call and **prepend** it to the ciphertext before base64 (format e.g. `base64(iv ‖ ciphertext)`), rather than relying on a shared default.
2. Change `decrypt` to read the IV from the leading bytes of the decoded payload for the new format.
3. Add a **legacy** decrypt path: if the payload doesn't carry a prepended IV (old format), fall back to `ENV.DEFAULT_IV` so existing encrypted data (addresses stored in D1, any long-lived tokens) still decrypts. Distinguish formats by a version byte/prefix or by length, chosen explicitly and documented.
4. Re-encrypt-on-read where practical: when a legacy-format address is decrypted (e.g. during a user update), re-encrypt it in the new format on the next write, so stored data migrates over time.
5. Audit all `encrypt`/`decrypt`/`encryptObjectString`/`decryptObjectString` callers to confirm none depend on deterministic output (e.g. using ciphertext as a cache key or equality check). If any do, fix that dependency — GCM output must not be assumed stable.
6. Add tests: round-trip with random IV; two encryptions of the same plaintext produce different ciphertext; legacy fixed-IV ciphertext still decrypts.

## Dependencies
**Depends on:** None. Coordinate with [feature 01](../01-admin-auth-rbac-cors/README.md) (JWT path) and [step-02](./step-02-refresh-token-expiry-revocation.md) (also token-related).
**Blocks:** None.

## Implementation notes
- **The legacy path is mandatory.** Addresses persisted in `users.address` and any encrypted values in cookies were written with the fixed IV; a hard cutover would make them undecryptable. Verify with a value produced by the current `encrypt` before changing it.
- Access tokens are short-lived (≤15 min) so their format churns quickly; addresses are the long-lived concern — prioritize the address re-encrypt-on-read path.
- Prepending the IV is standard and safe (the IV is not secret, only its uniqueness matters). 12 bytes is the GCM-recommended nonce size.
- Do not remove `DEFAULT_IV` from `Env` in this step — the legacy path still needs it. Its eventual removal is a later cleanup once all data has migrated; note that in [05](../05-configuration-data-hygiene/README.md).

## Acceptance criteria
- [ ] `encrypt` produces different ciphertext for identical plaintext across calls (random IV).
- [ ] New ciphertext round-trips through `decrypt` correctly.
- [ ] Data encrypted with the previous fixed-IV scheme still decrypts (legacy path).
- [ ] No caller relies on deterministic ciphertext (audited; any that did are fixed).
- [ ] Tests cover new round-trip, non-determinism, and legacy decrypt.

## References
- `libs/utils/crypto/encrypt/encryptor.ts` — `encrypt`, `decrypt`, `getDefaultIV`.
- `libs/utils/crypto/encrypt/object.ts` — `encryptObjectString`/`decryptObjectString`.
- `libs/utils/jwt/jwt-utils.ts` — `signJwt`/`decodeJwt` (encrypt/decrypt the JWT).
- `libs/db/user/actions/select.ts` — `decryptObjectString<Address>` on the stored address.
- `libs/entities/env/index.ts` — `DEFAULT_IV` (keep for legacy path).

## Verification (2026-07-03 · commit `SPIRIT-102` / `9e79c39`)
- `encrypt` now generates a fresh random 12-byte IV per call, prepends it to the ciphertext, and tags the output `v1.base64(iv‖cipher)`. The `.` in the prefix is not a base64 char, so it unambiguously distinguishes new from legacy (bare-base64) output. `decrypt` reads the prepended IV for `v1.` payloads and falls back to the fixed `DEFAULT_IV` for legacy ones. Removed the unused explicit-`iv` param.
- **Determinism audit (acceptance criterion):** grepped every `encrypt`/`decrypt`/`encryptObject`/`decryptObjectString` caller. No caller re-encrypts-and-compares. The two refresh-secret checks (`get-credentials.ts:115`, `config/logged-in.ts:22`) compare the KV-stored ciphertext to the client-echoed **same string** — not a re-encryption — so non-deterministic output is safe. Recorded.
- **Deviations (documented):** (1) `DEFAULT_IV` kept (legacy path needs it) — removal deferred to feature 05. (2) Re-encrypt-on-read (step 4) intentionally NOT added to the `select` mapper (would introduce write side-effects on read); legacy addresses migrate naturally on next write (address writes use the new format).
- Unit tests (`test/unit/encryptor.test.ts`, 4): `v1.` round-trip; same plaintext → different ciphertext (random IV) both decrypting; **legacy** fixed-IV bare-base64 decrypts; `encryptObject`/`decryptObjectString` round-trip.
- **E2E (wrangler dev, real config):** fresh login → `v1.` access token → `/private/products` **200**; a manually-minted **legacy-format** (fixed-IV, no-prefix) valid admin token → `/private/products` **200**. Both formats authenticate through the full flow → migration is backward-compatible.
- `npm run lint` (0 warnings) / `type-check` / `jest` (31) all exit 0.
