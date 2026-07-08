---
status: Done
priority: P0
feature: 03-payment-stock-integrity
track: backend-hardening
depends_on: ["04-testing-quality-gates/step-01"]
blocks: ["03-payment-stock-integrity/step-02"]
---
# Step 01: Fix the R2 lock first-acquire race and format bug

**Status:** Done · **Priority:** P0 · **Feature:** [Payment & Stock Integrity](./README.md)

> **Implementation note (2026-07-08).** `libs/adapters/r2/utils/lock.ts` rewritten:
> both write paths now store one validated JSON shape `{ expirationTime, token }`
> (Zod-parsed; unparseable/legacy values treated as expired), fixing the
> renewed-lock format bug. First-acquire uses write-then-read-back-verify with a
> caller `token` (R2 is strongly consistent) — of two racers exactly one wins;
> expired-lock takeover stays on the `etagMatches` conditional put. `releaseLock`
> now deletes only when the stored token matches the caller's, so an
> expired-and-taken-over holder can't delete the new holder's lock. Caller
> (`stockClient.updateStock`) generates a per-call token. R2 has no reliable
> create-only conditional in the current workers-types, so read-back-verify is
> the fallback (noted); a Durable Object is the escalation path. Tests in
> `test/unit/r2-lock.test.ts` cover all acceptance criteria.


## Technical goal
Make `acquireLock` actually mutually exclusive: eliminate the check-then-act race on first acquisition, and fix the inconsistent lock-value format that makes a *renewed* lock parse incorrectly (and therefore look expired).

## User impact
None visible directly — this is the primitive that prevents concurrent stock writers from clobbering each other. Fixing it prevents oversell/corruption under concurrent checkouts.

## Current state
`libs/adapters/r2/utils/lock.ts`:
- **Race:** `acquireLock` does `bucket.get(lockKey)`; if absent, it performs an **unconditional** `bucket.put(...)` and returns `true`. Two concurrent callers can both observe "no lock" and both "acquire" it. Only the takeover-of-expired-lock path uses a conditional put (`onlyIf: { etagMatches: existingLock.etag }`).
- **Format bug:** first acquisition writes `JSON.stringify({ expirationTime })` (an object), but the takeover path writes `expirationTime.toString()` (a bare number string). The read path always does `JSON.parse(await existingLock.text())` then checks `lock.expirationTime`. After one takeover, the stored value parses to a `number`, so `lock.expirationTime` is `undefined`, `undefined >= Date.now()` is `false`, and every subsequent caller treats the (possibly live) lock as expired and can steal it.
- Callers: `stockClient.updateStock` (`libs/adapters/r2/stock/stock-client.ts`) retries `acquireLock` up to `MAX_RETRIES = 5` with `STOCK_LOCK_TTL = 3000` ms.

## Technical steps
1. Unify the stored value: always `JSON.stringify({ expirationTime })` in **both** write paths (or a versioned shape); make the read path validate with a small Zod schema and treat unparseable/legacy values as expired-but-log.
2. Close the first-acquire race with a conditional create. Check the R2 API for a create-only condition (`onlyIf` with an etag-based "does not exist" condition). If R2's conditional-put support in the current `@cloudflare/workers-types` doesn't offer a reliable "only if absent" condition, use the fallback: **write, then read-back-and-verify** — put a unique token (`crypto.randomUUID()`) in the lock value, re-`get` after the put, and only claim acquisition if the read-back token matches your own. Document which approach was possible.
3. Make `releaseLock` safe: it currently deletes unconditionally, so a caller whose lock expired (and was taken over) can delete the *new* holder's lock. Store the holder token (step 2) and only delete when the current value carries your token (get → compare → delete; accept the small TOCTOU there or use a conditional delete if available).
4. Keep TTL semantics: expired locks must remain stealable via the `etagMatches` takeover path (that part is already correct).
5. Add focused unit tests with a mocked/in-memory `R2Bucket` implementing etag semantics: two racing first-acquires → exactly one winner; takeover after expiry works; renewed-lock value parses; release doesn't delete a lock held by another token.
6. Consider (and record) the longer-term note: a Durable Object would give real serialization without R2's weaker primitives. Out of scope to build now; note it in the code comment or PR description as the escalation path if lock contention grows.

## Dependencies
**Depends on:** None.
**Blocks:** [step-02](./step-02-tri-store-stock-consistency.md) (the unified write path relies on a correct lock).

## Implementation notes
- The lock's purpose today is narrow: serialize R2 stock-object writes per product (`lock-${productId}`). Keep the fix scoped to correctness; don't redesign the locking model.
- The read-back-verify fallback costs one extra R2 read per acquisition — negligible at current scale, and strictly better than a broken lock.
- `stockClient.updateStock` treats `acquireLock` returning `false` as retry-then-**give-up-silently** (no throw after 5 tries). Step 2 changes that; here, just don't make it worse — keep the boolean contract.
- Beware clock skew: expiry uses `Date.now()` on whichever isolate runs; TTLs of 3s are fine but don't tighten them.

## Acceptance criteria
- [ ] Both lock-write paths store the same JSON shape, and the read path validates it.
- [ ] Two simulated concurrent first-acquisitions yield exactly one `true`.
- [ ] After a takeover, a third caller correctly sees the lock as *held* until its TTL passes.
- [ ] `releaseLock` cannot delete a lock held by a different holder token.
- [ ] Unit tests for the above pass in CI.

## References
- `libs/adapters/r2/utils/lock.ts` — `acquireLock`/`releaseLock` (both bugs).
- `libs/adapters/r2/stock/stock-client.ts` — the only caller (`updateStock`, `STOCK_LOCK_TTL`, `MAX_RETRIES`).
- `@cloudflare/workers-types` (in `package.json`) — check the exact `R2PutOptions.onlyIf` conditions available.
