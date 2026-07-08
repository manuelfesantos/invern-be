# Invern Spirit Backend — Implemented Changes & Verification Guide

> Session date: **2026-07-03** · Repo: `/Users/manuelfesantos/personal-projects/invern-be` · Branch: **`spirit-plan-execution`** (off `preview`).
> Nothing pushed. 9 commits, working tree clean, **31 unit tests passing**.

This document lists everything implemented so far and gives you concrete ways to
verify each piece works. Every change was already verified end-to-end this
session; the steps below let you reproduce that.

---

## What got done (map)

| Feature | Step | Status | Commit |
|---|---|---|---|
| **01 — Admin Auth, RBAC & CORS** | 01 Role claim in JWT | ✅ | `0a3c306` |
| | 02 `/private` RBAC middleware | ✅ | `641c1df` |
| | 03 Env-driven CORS (both frontends) | ✅ | `cbb6cde` |
| | 04 Real swagger auth scheme + tests | ✅ | `6bf78c7` |
| **02 — Credential & Session Hardening** | 01 PBKDF2 password hashing + migration | ✅ | `cb81848` |
| | 02 Refresh-token expiry + revocation | ✅ | `ceb64a6` |
| | 03 AES-GCM per-message IV | ✅ | `9e79c39` |
| | 04 Login rate limiting | ⬜ not done (P1) | — |
| **04 — Testing & Quality Gates** | 01 Jest harness + fakes + smoke tests | ✅ | `a6f97cd` |
| | 02 Critical-path test suites | ⬜ not done (P0) | — |
| | 03 Real `main` CI gate | ✅ | `25fa521` |

**Feature 01 is fully complete.** Features 02 and 04 are partially complete.

---

## 0. Prerequisites to verify locally

You need the local dev server running against a seeded local D1. If you already
have it running, skip to §1.

```bash
cd /Users/manuelfesantos/personal-projects/invern-be

# .dev.vars must exist (real values you provided are installed; it's gitignored)
npm run db:migrate:local          # apply schema to local D1
npm run start                     # wrangler pages dev on :8788 (or pass a port)
```

Seed data + an ADMIN user (only needed once, if your local DB is empty):

```bash
# From another shell, with the server running. Replace <BASE> with your API URL
# Idempotent seed script (replaces the old /private/insert-test-data endpoint):
npm run seed                 # local D1
# npm run seed -- --env=preview --yes   # remote (preview/prod) requires --yes

# Ensure you have an ADMIN. If you don't, promote any validated user:
npm run query-local "UPDATE users SET role='ADMIN' WHERE email='<your-email>'"
```

> The DB I seeded this session has `admin@invern.local` / `admin1234` (ADMIN) and
> `user@invern.local` / `user1234` (USER), plus 3 collections / 12 products /
> 2 countries / 2 taxes / 1 shipping method (taxes pulled live from your Stripe
> test account).

### Reusable "get an admin session" snippet

The auth flow has a gotcha: **`/user/*` is a protected endpoint**, so login
itself requires *anonymous* tokens first (the storefront gets these from
`/config`). This helper does the full dance and exports `$AT` (access token) and
`$SR` (refresh cookie value):

```bash
BASE=http://127.0.0.1:8788      # your API base
CC=PT                            # any seeded country code

jtok() { node -e "console.log(JSON.parse(require('fs').readFileSync('$1','utf8')).accessToken||'')"; }
srck() { grep -i 'set-cookie: *s_r=' "$1" | head -1 | sed -E 's/.*s_r=([^;]+);.*/\1/I'; }

admin_session() {
  # 1) anonymous tokens from /config
  curl -sk -D /tmp/h1 -o /tmp/c1.json "$BASE/public/countries/$CC/config" >/dev/null
  local aat=$(jtok /tmp/c1.json)
  local asr=$(srck /tmp/h1)
  # 2) login as admin using those tokens
  curl -sk -D /tmp/h2 -o /tmp/c2.json -X POST "$BASE/public/countries/$CC/user/login" \
    -H "Authorization: Bearer $aat" -H "Cookie: s_r=$asr" \
    -H 'Content-Type: application/json' \
    -d '{"email":"admin@invern.local","password":"admin1234"}' >/dev/null
  export AT=$(jtok /tmp/c2.json)
  export SR=$(srck /tmp/h2)
  echo "logged in; token starts: ${AT:0:6}… (len ${#AT}, s_r len ${#SR})"
}
admin_session
```

> Note: extract JSON fields with `JSON.parse(fs.readFileSync(...))`, **not**
> `require('/tmp/file')` — `require` on a file without a `.json` extension tries
> to load it as JavaScript and chokes on the JSON.

`/private/*` requests need **both** headers: `-H "Authorization: Bearer $AT" -H "Cookie: s_r=$SR"`.

---

## 1. Fastest check — the automated suite

```bash
cd /Users/manuelfesantos/personal-projects/invern-be
npm run lint          # → 0 problems
npm run type-check    # → no output, exit 0
npm test              # → 9 suites, 31 tests, all pass
```

If all three exit 0, the static + unit layer is healthy. Test files added this
session (all under `test/`):

- `test/harness.ts`, `test/fakes/{kv,r2,logger}.ts`, `test/fakes/r2.test.ts` — the harness + fakes.
- `test/smoke/{redact,hash,get-all-collections}.test.ts` — harness smoke tests.
- `test/unit/jwt-role.test.ts` — JWT carries `role`.
- `test/unit/private-middleware.test.ts` — RBAC: anon 401 / USER 403 / ADMIN pass / preflight ok / maintenance bypass.
- `test/unit/password.test.ts` — PBKDF2 + legacy verify + rehash flag.
- `test/unit/refresh-token.test.ts` — refresh `exp`, KV TTL, revocation primitive.
- `test/unit/encryptor.test.ts` — random-IV round-trip, non-determinism, legacy decrypt.

---

## 2. Feature 01 — Admin Authentication, RBAC & CORS

### What changed & why
The entire `/private/*` admin surface was **completely unauthenticated** (anyone
could create/delete products, read all users/orders, etc.). Now:

| Change | Files |
|---|---|
| Access-token JWT carries the user's `role` (`ADMIN`/`USER`); login + refresh-mint populate it | `libs/entities/jwt/jwt-entity.ts`, `libs/utils/jwt/jwt-utils.ts`, `libs/entities/user/roles.ts`, `libs/modules/user/use-cases/login.ts`, `libs/utils/jwt/credentials/get-credentials.ts`, `libs/entities/request/index.ts` |
| **New** `/private` middleware requires `role === ADMIN` — single source of truth | `functions/private/_middleware.ts` |
| Env-driven CORS allow-list echoing storefront **and** backoffice origins (never `*`), applied in all envs; OPTIONS preflight answered without auth | `libs/utils/http/cors.ts` (new), `functions/_middleware.ts`, `libs/entities/env/index.ts` (`BACKOFFICE_HOST`), `functions/private/stock/[productId]/index.ts` (removed one-off header) |
| Swagger: placeholder `X-Admin-Secret-Key` → real `AdminBearer` (JWT) scheme | `swagger.yaml` |

**Maintenance routes** (`stock/setup`, `expired/*`) bypass
the RBAC gate — the first two keep their own body-secret check; `expired/*` was
already unauthenticated and has no caller in the repo (flagged for feature 06 to
add a service token).

### How to verify (with `admin_session` from §0)

```bash
# RBAC: three outcomes on a real admin route
curl -sk -o /dev/null -w "anonymous:  %{http_code}\n"  "$BASE/private/products"                       # → 401
# USER token (log in as user@invern.local / user1234 into $AT/$SR first) → 403
curl -sk -o /dev/null -w "admin:      %{http_code}\n"  "$BASE/private/products" \
  -H "Authorization: Bearer $AT" -H "Cookie: s_r=$SR"                                                   # → 200

# Every admin list route is gated (all should be 401 anonymous)
for r in users currencies countries collections orders carts; do
  curl -sk -o /dev/null -w "$r: %{http_code}\n" "$BASE/private/$r"
done

# CORS: allowed origin echoed, disallowed gets none, preflight needs no auth
curl -sk -D - -o /dev/null -X OPTIONS "$BASE/private/products" \
  -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: GET" | grep -i "access-control"
#   → Access-Control-Allow-Origin: http://localhost:5173  + Allow-Credentials: true  (HTTP 204)
curl -sk -D - -o /dev/null -X OPTIONS "$BASE/private/products" \
  -H "Origin: https://evil.example.com" | grep -i "access-control-allow-origin" || echo "no ACAO (correct)"
```

To confirm the token actually carries the role, decode a logged-in access token
(it's AES-GCM-encrypted then a JWT). The payload includes `"role":"ADMIN"`.

**Expected:** anonymous → 401, USER → 403, ADMIN → 200; allowed origins echoed,
disallowed origins get no CORS header; preflight → 204 without auth.

---

## 3. Feature 02 — Credential & Session Hardening (steps 1–3)

### 3.1 PBKDF2 password hashing + transparent migration (`cb81848`)

**Was:** single-round SHA-256 (`password + SALT + userId`). **Now:** PBKDF2-HMAC-SHA256,
600k iterations, per-user random salt, stored self-describing:
`pbkdf2$sha256$<iter>$<b64salt>$<b64hash>`. Old hashes still verify and are
**transparently upgraded on next login** (no forced reset).

Files: `libs/utils/crypto/password.ts` (new), `libs/utils/crypto/hash.ts`
(kept `hashString`, removed old password hash), `libs/utils/crypto/index.ts`,
`libs/db/user/actions/{insert,update}.ts` (writers), `libs/modules/user/use-cases/login.ts`
+ `.../update-user/password/index.ts` (verifiers).

**Verify the migration:**
```bash
# 1) inspect a user's stored hash BEFORE their first login on the new code:
npm run query-local "SELECT email, substr(password,1,7) fmt, length(password) len FROM users"
#    legacy users show a 64-char hex; migrated users show 'pbkdf2$' (len ~90)

# 2) log that user in once (admin_session), then re-inspect — it's now pbkdf2$…
#    Log in AGAIN — still works, no second rehash. Wrong password → 401.
```

> Note: ~47ms per hash (measured). Fine on Cloudflare paid/standard CPU; the
> iteration count is tunable via the stored params without another migration.

### 3.2 Refresh-token expiry + revocation (`ceb64a6`)

**Was:** refresh tokens never expired; `logout` didn't revoke anything (the
stored KV secret survived logout). **Now:** refresh tokens carry `exp` (2 weeks),
the `AUTH_KV` secret has a matching TTL, and `logout` + password-change delete
the stored secret — so a captured/post-logout refresh token stops working.

Files: `libs/utils/timer/index.ts` (`REFRESH_TOKEN_EXPIRY`),
`libs/utils/jwt/jwt-utils.ts`, `libs/adapters/kv/auth/auth-secret-client.ts`,
`libs/modules/user/use-cases/logout.ts`, `.../update-user/password/index.ts`.

**Verify revocation** (the definitive test needs a still-valid *access* token
after logout; simplest observable check):
```bash
admin_session                     # log in
curl -sk -X POST "$BASE/public/countries/$CC/user/logout" \
  -H "Authorization: Bearer $AT" -H "Cookie: s_r=$SR" -o /dev/null -w "logout: %{http_code}\n"   # → 200
# The refresh secret is now deleted; the pre-logout refresh token can no longer
# mint new access tokens (once the 15-min access token expires, the session ends).
```
(Unit test `test/unit/refresh-token.test.ts` proves the `exp`, TTL, and delete
primitives directly.)

### 3.3 AES-GCM per-message IV (`9e79c39`)

**Was:** every AES-GCM encryption reused a single fixed IV (`DEFAULT_IV`) — a
nonce-reuse weakness across all JWTs / stored addresses / shipping-method ids.
**Now:** a fresh random 12-byte IV per message, prepended to the ciphertext,
tagged with a `v1.` prefix. **Legacy** (bare-base64, fixed-IV) data still
decrypts, so existing sessions/addresses keep working.

Files: `libs/utils/crypto/encrypt/encryptor.ts`.

**Verify:** log in and note the access token now begins with **`v1.`**. It still
authenticates on `/private/*` (proves new-format round-trips through the real
flow). Legacy tokens (no prefix) also still authenticate (proven via a
hand-minted legacy token this session; also covered by `encryptor.test.ts`).

> Audit done: no code re-encrypts-and-compares, so non-deterministic ciphertext
> is safe (the refresh-token check compares the *stored* string to the
> *client-echoed* same string, not a re-encryption).

---

## 4. Feature 04 — Testing & Quality Gates (steps 1, 3)

### 4.1 Jest harness + fakes + smoke tests (`a6f97cd`)
The repo had **zero tests** and `--passWithNoTests`. Now there's a real harness
(`withTestContext` sets up the ENV/logger/context globals; in-memory KV + R2
fakes with faithful etag semantics) and the first suites. Also fixed:
- `jest.config.ts` couldn't even run on Node ≥22 (ESM JSON import) and didn't
  transpile ESM-only deps → fixed both.
- A **pre-existing lint break** on `preview` (`libs/modules/user/utils/validate-secret.ts`
  had an unused import) → removed.

Verify: `npm test` (31 pass) and `npm run lint` (0 problems, was failing before).

### 4.2 Real `main` CI gate (`25fa521`)
`validate-pr-to-main.yml` previously only checked the source branch name (and had
a buggy `gh pr close`) then ran a placeholder. Now both PR workflows call a
shared reusable `quality-gate.yml` (lint + test + type-check on Node 20). The
`main` gate keeps the "source must be `preview`" rule (fails instead of
auto-closing) with narrowed permissions.

Verify: it can't run locally (GitHub Actions), but the YAML is valid and the gate
commands are the same `npm run lint/type-check/test` that pass locally. It runs
for real when you open a PR. **You'll need to enable branch protection** to
require these checks (repo Settings → Branches).

---

## 5. Decisions made this session

- **Commit convention:** `SPIRIT-1NN` per feature (01→101, 02→102, 04→104).
- **Password migration:** lazy rehash-on-login (no forced global reset).
- **`users.version`:** *not* used for auth — KV revocation + the 15-min
  access-token TTL close the hole. (Version-in-token is the future path for
  "log out all devices".)
- **`expired/*` routes:** left bypassing RBAC (no caller in the repo) rather than
  breaking a possible external scheduler — flagged for a service token in feature 06.
- **CORS backoffice origin:** assumed `http://localhost:5173` (Vite default) —
  confirm/adjust when the backoffice is scaffolded (feature 15).

## 6. Known limitations / not yet verified for real

- **Login rate limiting** (feature 02-04) and **critical-path test suites**
  (feature 04-02) are not done yet.
- **Stripe webhooks, Brevo email, Google OAuth**: your real creds are installed,
  but these flows weren't exercised this session (the seed's Stripe **tax** call
  *was* — it works). Webhook idempotency is feature 03-03.
- **Error responses leak a `stack` field** (pre-existing, systemic) — recorded as
  a new item under feature 06.
- **CI workflows** verified by YAML validity + local gate runs only (Actions
  can't run on this machine).

## 7. One-shot smoke checklist

- [ ] `npm run lint && npm run type-check && npm test` → all green (31 tests)
- [ ] `admin_session` logs in (200) and the access token starts with `v1.`
- [ ] `GET /private/products` → 401 anonymous, 200 with admin headers
- [ ] A legacy-hash user's stored `password` becomes `pbkdf2$…` after one login
- [ ] `OPTIONS /private/products` from an allowed origin → 204 + CORS headers, no auth
- [ ] `POST /user/logout` (admin) → 200
- [ ] Swagger UI shows the `AdminBearer` (JWT) security scheme

---

*Full per-step detail (with the exact verification transcripts) lives in each
step file's "Verification" section under the feature folders in this plan.*
