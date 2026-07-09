# 03 — Payment & Stock Integrity

**Status:** Done · **Priority:** P0 · **Track:** Backend Hardening

> **Done (SPIRIT-103):** step-01 (R2 lock race + format), step-02 (tri-store stock consistency — negative-stock guard, loud lock-exhaustion, stock stripped from product updates, delete-cleanup, and the **unified `@stock-module` reserve/release path** every writer funnels through), step-03 (webhook idempotency, live-verified with signed webhooks). One hardening follow-up remains explicitly out of scope: atomic reserve-abort when the D1 guard skips a row (needs a reservation counter / Durable Object) — the guard already blocks negative stock.

## Summary
Stock is tracked in three stores that must agree — `products.stock` in D1, a `STOCK_KV` cache, and `STOCK_BUCKET` (R2) as the source of truth guarded by an R2-based distributed lock. The lock has a check-then-act race on first acquisition **and** a data-format bug that makes renewed locks look expired. Separately, editing a product through the admin API writes D1 stock only, silently desyncing the other two stores — which directly threatens any backoffice "adjust stock" screen. This feature makes the lock correct, makes stock writes go through one consistent path across all three stores, and verifies the Stripe webhook handlers are idempotent under replay.

## Why this matters
Stock correctness is money: oversell (accepting orders you can't fulfill) and phantom stockouts (refusing sellable inventory) both come straight out of this layer. Under concurrency the current lock does not actually serialize the first writer, and a renewed lock is mis-read as expired — so the guarantees the system appears to have aren't real. And the moment a human edits a product's stock in the backoffice, today's code path drifts the three stores apart. These are launch-blocking because they only manifest under real traffic, when they're most expensive.

## Why this matters for the backoffice specifically
Feature [22 — Stock Management UI](../22-backoffice-stock/README.md) and the product edit form in [18 — Catalog](../18-backoffice-catalog/README.md) both need a **single correct write path** that updates D1, KV and R2 together. That path must exist and be trustworthy here before those screens are built, or the UI will confidently show and write inconsistent numbers.

## Goals — what "done" looks like
- The R2 lock cannot be acquired by two writers simultaneously on first creation, and a renewed lock is read back correctly (format bug fixed).
- There is exactly one stock-mutation path that keeps D1, KV and R2 consistent, and every writer (checkout reserve/release, expiry, admin product edit, admin stock adjust) uses it.
- Editing a product's stock via the admin API no longer desyncs KV/R2.
- The Stripe webhook handlers are confirmed idempotent: a replayed `checkout.session` or `payment_intent` event cannot double-create an order or double-adjust stock.
- The riskiest paths (lock, reserve/release, webhook replay) have tests.

## User / business impact
Shoppers: no oversell or false "out of stock"; orders and payments aren't duplicated on webhook retries. Admin staff: the stock they see and set in the backoffice is the real, consistent number. On-call: far fewer "why is stock wrong" incidents.

## In scope / Out of scope
**In scope:** R2 lock correctness (race + format); a unified tri-store stock write path; fixing the product-edit stock desync; webhook idempotency verification/hardening; tests.
**Out of scope:** a scheduled background reconciliation job that repairs pre-existing drift (deferred — see root README "Explicitly out of scope"); the stock **UI** (feature 22).

## Dependencies
**Depends on:** [04 — Testing & Quality Gates](../04-testing-quality-gates/README.md) `step-01` (tests for concurrency-sensitive code).
**Blocks:** [22 — Stock Management UI](../22-backoffice-stock/README.md); the stock-editing part of [18 — Catalog](../18-backoffice-catalog/README.md).

## Steps
| # | Step | Priority | Status | Depends on |
|---|---|---|---|---|
| 01 | [Fix the R2 lock first-acquire race and format bug](./step-01-fix-r2-lock-race-and-format.md) | P0 | Done | — |
| 02 | [Unify the tri-store stock write path (fix product-edit desync)](./step-02-tri-store-stock-consistency.md) | P0 | In Progress | step-01 |
| 03 | [Verify & harden webhook idempotency](./step-03-webhook-idempotency.md) | P0 | In Progress | — |

## Key risks
- **Concurrency bugs are invisible until load.** These need tests that actually exercise interleaving (or at least the conditional-write logic), not just happy-path assertions. Budget for that.
- **The reserve/release compensation already assumes the lock works.** `checkout/index.ts` `reserveLineItems` decrements D1 then updates R2/KV, rolling back D1 on failure. If the lock fix changes timing/return semantics, re-verify that compensation still holds.

## Relevant existing code
- `libs/adapters/r2/utils/lock.ts` — `acquireLock`/`releaseLock` (the race + the format inconsistency).
- `libs/adapters/r2/stock/stock-client.ts` — `updateStock`/`updateMany`/`setKV`/`getFromBucket`/`delete`; the retry loop around the lock.
- `libs/modules/order/use-cases/checkout/index.ts` — `reserveLineItems` (D1 decrement + R2/KV update + rollback).
- `libs/modules/order/use-cases/handle-session-expired-event.ts` — stock release on session expiry.
- `libs/db/product/actions/update-products-stock.ts` — the D1 increase/decrease SQL.
- `libs/modules/product/use-cases/update-product.ts` / `operations/update-product.ts` — the admin product update that writes D1 stock only.
- `functions/stripe/session-result/index.ts`, `functions/stripe/payment-intent/index.ts` — the webhook handlers.
- `libs/modules/order/use-cases/get-order-from-session-result.ts` — order creation with an `ORDER_ALREADY_EXISTS` guard (existing idempotency).
