---
status: Done
priority: P1
feature: 02-credential-session-hardening
track: backend-hardening
depends_on: []
blocks: []
---
# Step 04: Rate limiting on credential endpoints

**Status:** Done · **Priority:** P1 · **Feature:** [Credential & Session Hardening](./README.md)

> **Implementation note (2026-07-08).** Done via **Option A** — the Cloudflare
> Workers **Rate Limiting binding** (`ratelimits` in `apps/backend/wrangler.jsonc`),
> not a hand-rolled KV counter. Config-only, no namespace to provision, backed by
> Cloudflare's rate-limit infra. Two per-email limiters:
> `LOGIN_RATE_LIMITER` (8/60s) on `POST /user/login`, and `EMAIL_RATE_LIMITER`
> (3/60s) on `forgot-password/submit-email` + `signup/resend-email`.
> Enforced by a Hono middleware (`apps/backend/src/middleware/rate-limit.ts`)
> that keys on the email (read from a body clone), returns a sanitized,
> non-enumerating `429 {"issues":["too many requests"]}`, and skips when no email
> is present (handler validation then 400s).
>
> **Deliberate deviation from the spec:** the binding's window is capped at 60s
> and counts calls (no manual reset / outcome-based counter), so the "5 failures
> → 15-min lockout, reset on success" mechanic was intentionally dropped — the
> 60s window stops automated stuffing/bombing (the real threat), and PBKDF2
> (step 01) already makes slow human brute-force impractical. The coarse
> **per-IP edge/WAF layer** remains a deploy-time item (feature 06 runbook);
> Cloudflare discourages IP keys in the binding itself.
>
> **Verified locally** (`wrangler dev` emulates the binding): login → 8×401 then
> 429; forgot-password → 3× then 429; a different email is unaffected; normal
> login/signup unchanged. Unit tests in `test/unit/rate-limit.test.ts` cover
> threshold breach, key normalization, body-not-consumed, and skip-when-no-email
> (the window/reset itself is CF infra, exercised against the live binding).

## Technical goal
Add abuse protection (rate limiting / lockout) to the credential-sensitive public endpoints — login, forgot-password submit, and signup email resend — so credential stuffing and email-bombing are throttled.

## User impact
Shoppers/admins: brute-force and spam attempts against their accounts are slowed/blocked; legitimate users are essentially never affected by the thresholds. On-call: reduces the noise and risk from automated attacks.

## Current state
- No rate limiting or lockout exists anywhere (verified: no `rateLimit`/`throttle`/`429` handling in `functions`/`libs`).
- `login.ts` accepts unlimited password attempts.
- `forgot-password` has a partial notion of locking a *code* via `FORGOT_SECRET_LOCKED_EXPIRY` (`libs/utils/timer/index.ts`) but no per-identifier/IP request throttle.
- KV adapters already exist (`libs/adapters/kv/**`) and are the natural backing store for counters.

## Technical steps
1. Choose the mechanism. Two viable options:
   - **Cloudflare's native Rate Limiting** (WAF / the Workers rate-limiting binding) — enforced at the edge, no app state. Preferable for a blunt per-IP throttle; configured in Cloudflare, referenced in the deploy runbook ([06](../06-observability-ops-readiness/README.md)).
   - **App-level KV counter** — increment a KV key per identifier (email) and/or IP with a short TTL window, reject with `429` past a threshold. More control (per-account lockout), reusing the existing KV adapter pattern.
   - Recommended: **both layers** — a coarse edge per-IP limit plus an app-level per-email lockout on login.
2. Implement an app-level limiter helper (in `libs/utils/**` or a KV adapter) that, given a key + window + max, returns allow/deny and remaining. Back it with a KV namespace (reuse an existing one or add a `RATE_LIMIT_KV` binding, coordinating with [05](../05-configuration-data-hygiene/README.md) and `wrangler.toml`).
3. Apply it to: `POST /user/login` (per email + per IP), `POST /user/forgot-password/submit-email` (per email + IP), `POST /user/signup/resend-email` (per email + IP). Return `429` with a `Retry-After`-style message on breach; keep the response non-enumerating (don't reveal whether the email exists).
4. On repeated login failures for an email, apply a temporary lockout window (exponential backoff or fixed cooldown). Reset the counter on a successful login.
5. Ensure the limiter reads the real client IP correctly under Cloudflare (`request.cf` / `CF-Connecting-IP`), not a spoofable header; the middleware already logs `cf-connecting-ip` as redacted.
6. Add tests for the counter logic (threshold, window reset, lockout).

## Dependencies
**Depends on:** None. If a new KV binding is added, coordinate with [05](../05-configuration-data-hygiene/README.md) and `wrangler.toml`.
**Blocks:** None.

## Implementation notes
- Keep thresholds generous enough that a human fat-fingering a password a few times is never locked out, but tight enough to stop automated stuffing (e.g. ~5–10 failures per email per 15 min, plus a higher per-IP ceiling).
- **Don't leak account existence.** The `429`/lockout message and timing must be the same whether or not the email is registered, consistent with how login already returns a generic `INVALID_CREDENTIALS`.
- KV is eventually consistent; a determined attacker hitting many colos can exceed a KV-based limit slightly. That's why the edge per-IP layer is recommended alongside it. Don't rely on KV counters alone for a hard guarantee.
- This is P1 (not P0) because feature 01 (auth gate) and steps 1–3 close the higher-severity holes first; but it should land before launch given how cheap credential stuffing is.

## Acceptance criteria
- [ ] Login, forgot-password submit, and resend-email enforce a rate limit / lockout and return `429` past threshold.
- [ ] A successful login resets the failure counter for that email.
- [ ] The limiter uses the trusted Cloudflare client IP, not a spoofable header.
- [ ] Responses do not reveal whether an email is registered.
- [ ] Unit tests cover threshold breach, window reset, and lockout/cooldown.

## References
- `libs/modules/user/use-cases/login.ts` — login attempt path.
- `libs/modules/user/use-cases/forgot-password/submit-email.ts` — forgot-password submit.
- `libs/modules/user/use-cases/signup/resend-email.ts` — resend path.
- `libs/adapters/kv/**` — KV client pattern for counters.
- `libs/utils/timer/index.ts` — `FORGOT_SECRET_LOCKED_EXPIRY` (existing lock window to align with).
- `functions/_middleware.ts` — where `cf-connecting-ip` / `request.cf` are available.
