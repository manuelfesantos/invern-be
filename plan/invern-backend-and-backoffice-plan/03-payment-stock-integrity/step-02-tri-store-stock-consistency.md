---
status: In Progress
priority: P0
feature: 03-payment-stock-integrity
track: backend-hardening
depends_on: ["03-payment-stock-integrity/step-01"]
blocks: ["22-backoffice-stock/step-02", "18-backoffice-catalog/step-02"]
---
# Step 02: Unify the tri-store stock write path (fix product-edit desync)

**Status:** In Progress · **Priority:** P0 · **Feature:** [Payment & Stock Integrity](./README.md)

> **Progress note (2026-07-08).** Concrete correctness bugs fixed + verified:
> (1) **guarded D1 decrement** — `decreaseProductsStockQuery` only decrements
> `WHEN stock >= quantity`, so concurrent over-decrement can't drive stock below
> zero (proved live against D1); (2) **`stockClient.updateStock` now throws** on
> lock exhaustion instead of silently returning, and writes R2 before the KV
> cache (KV is a cache of the source of truth) — `reserveLineItems`' existing
> try/catch compensation restores D1 on failure; (3) **`PUT /private/products/{id}`
> no longer accepts `stock`** (schema `omit`), killing the admin desync; (4)
> **`deleteProduct` now calls `stockClient.delete`** to clear KV+R2. Tests:
> `test/unit/r2-lock.test.ts`, `test/unit/product-update-stock.test.ts`.
>
> **Remaining (deliberately deferred):** the single unified `setProductStock`/
> `adjustProductsStock` operation that *all* writers funnel through (criterion 5)
> — the individual writers are consistent today, but the consolidation (to
> prevent any future D1-only writer) is a follow-up refactor; full **atomic
> reserve-abort when the guard skips a row** needs a reservation counter / Durable
> Object (the guard already prevents the money-critical negative stock); and the
> **swagger** payload change is folded into feature 14.


## Technical goal
Create one authoritative "set/adjust stock" operation that updates D1, `STOCK_KV` and `STOCK_BUCKET` together (with the fixed lock), make **every** stock writer use it, and make failures loud instead of silent. Concretely fixes: admin product updates that write D1 stock only; `updateStock`'s silent give-up after lock retries; and the unguarded D1 decrement that can drive stock negative.

## User impact
Shoppers: stock shown/checked at checkout matches reality; no oversell from negative-stock decrements. Admin staff: editing stock in the backoffice (features 18/22) changes the *real* number everywhere.

## Current state
- **Three stores:** `products.stock` (D1) is what cart/checkout validation reads (via product selects); `STOCK_KV` is a 12h-TTL cache (`setKVStock`); `STOCK_BUCKET` (R2) holds `{ data: <stock> }` per product and is served/purged via `STOCK_HOST` (`stock-client.ts`).
- **Product-edit desync:** `insertProductSchema` includes `stock` (`libs/entities/product/product-entity.ts`), and `PUT /private/products/{id}` → `updateProduct` → `updateProductOperation` performs only a D1 update (`libs/modules/product/use-cases/operations/update-product.ts`). KV/R2 are never touched → they go stale until the 12h KV TTL or a manual `/private/stock/setup` run.
- **Silent give-up:** `stockClient.updateStock` writes KV **before** acquiring the lock, then retries the lock up to 5×; if it never acquires, it just returns — KV updated, R2 not, **no error thrown** (`stock-client.ts`). Callers' compensation logic (below) therefore never fires for this failure mode.
- **Compensation exists but is partial:** `reserveLineItems` (`libs/modules/order/use-cases/checkout/index.ts`) decrements D1, then calls `stockClient.updateMany`; on a *thrown* error it re-increments D1 and calls `updateMany` again — but nothing handles the silent-give-up case, and the compensating `updateMany` can itself fail.
- **Unguarded decrement:** `decreaseProductsStockQuery` (`libs/db/product/actions/update-products-stock.ts`) sets `stock = stock - quantity` with no `stock >= quantity` guard. Two concurrent checkouts that both passed the earlier read-time validation (`validateLineItems`) can drive stock negative — a classic TOCTOU.
- **Product deletion leak:** `deleteProduct` (`libs/modules/product/use-cases/delete-product.ts`) deletes only the D1 row; `stockClient.delete` (which clears KV+R2) is never called for it — stale KV/R2 entries persist for deleted products.
- `/private/stock/setup` (secret-gated) rebuilds KV+R2 for all products from D1 — the existing full-resync escape hatch.

## Technical steps
1. Add a guarded D1 decrement: give `decreaseProductsStockQuery` a per-product `WHERE`/`CASE` guard so stock can't go below zero, and have the action report which products failed (compare `returning` stock values / affected rows). `reserveLineItems` must treat a failed guard as `PRODUCTS_OUT_OF_STOCK` and abort **before** any R2/KV write.
2. Make `stockClient.updateStock` throw (or return a failure result that callers must handle) when the lock can't be acquired after retries — eliminate the silent return. Reorder so KV is written **after** the R2 write succeeds (KV is a cache of the source of truth, not a leader), i.e. lock → R2 put → purge cache → KV set → release.
3. Introduce a single `setProductStock(productId, newStock)` / `adjustProductsStock(deltas[])` operation (module-level, e.g. under `libs/modules/product/` or a new `libs/modules/stock/`) that performs D1 write + `stockClient` write-through and is the **only** sanctioned mutation path.
4. Route all writers through it: checkout reserve (`reserveLineItems`), release paths (`handle-session-expired-event.ts`, `delete-expired-checkout-sessions.ts`, `invalidate-checkout-session.ts`), and the admin product update.
5. Fix the admin product update: either strip `stock` from the product-update payload (stock changes go through the dedicated stock operation/endpoint — cleaner; coordinate with [22](../22-backoffice-stock/README.md)) **or** make `updateProduct` call the unified operation when `stock` changes. Recommended: **strip it** from `PUT /private/products/{id}` and expose stock changes only via the stock endpoint (see [22 step-02](../22-backoffice-stock/step-02-adjust-stock-flow.md) for the consuming UI; the endpoint itself is added here or reused from `/private/stock/*`).
6. Call `stockClient.delete(productId)` when a product is deleted.
7. Tests: negative-stock guard under simulated concurrent decrement; lock-exhaustion now surfaces an error and triggers compensation; product update can no longer silently change stock; delete clears KV/R2.

## Dependencies
**Depends on:** [step-01](./step-01-fix-r2-lock-race-and-format.md) (correct lock).
**Blocks:** [22 — Stock Management UI](../22-backoffice-stock/README.md) `step-02`; [18 — Catalog](../18-backoffice-catalog/README.md) `step-03` (product form must know stock is excluded from the update payload).

## Implementation notes
- **Decide and document the hierarchy:** D1 is where transactional decrements happen (it's what checkout validates against), R2 is the durable per-product stock object served via CDN, KV is a cache. The write path should make that explicit in one place; ambiguity here is how the three drifted apart.
- Partial-failure honesty: after step 2, a failed R2 write leaves D1 changed and an error propagating — the checkout compensation then restores D1. Test the *compensation failure* case too and make sure it logs loudly (`logger().error`) with product ids, since that's the manual-intervention scenario (`/private/stock/setup` is the recovery tool; reference it in the error message or runbook, see [06](../06-observability-ops-readiness/README.md)).
- The API change (stripping `stock` from product updates) is a breaking change to the admin API contract — update `swagger.yaml` and coordinate with [14](../14-api-contract-typed-client/README.md) and the backoffice product form ([18 step-02](../18-backoffice-catalog/step-02-product-create-edit-form.md)).
- `update-cart-item-quantity.ts` uses `waitUntil(stockClient.setKV(...))` for a KV-only refresh — that's a cache refresh, not a mutation of truth; leave it, but confirm it can't resurrect a deleted product's KV entry.

## Acceptance criteria
- [ ] Concurrent over-decrement cannot drive `products.stock` below zero (test proves the guard).
- [ ] Lock exhaustion in `stockClient` raises an error; checkout compensation runs and restores D1.
- [ ] `PUT /private/products/{id}` can no longer change stock out-of-band (payload rejected or routed through the unified operation).
- [ ] Deleting a product removes its KV and R2 stock entries.
- [ ] All stock writers (reserve, release ×3, admin) call the single unified operation.
- [ ] `swagger.yaml` reflects any payload changes.

## References
- `libs/adapters/r2/stock/stock-client.ts` — write ordering, silent give-up, `delete`.
- `libs/db/product/actions/update-products-stock.ts` — unguarded `stock - quantity` SQL.
- `libs/modules/order/use-cases/checkout/index.ts` — `reserveLineItems` + compensation.
- `libs/modules/order/use-cases/handle-session-expired-event.ts`, `delete-expired-checkout-sessions.ts`, `invalidate-checkout-session.ts` — release paths.
- `libs/modules/product/use-cases/operations/update-product.ts`, `delete-product.ts` — admin update/delete.
- `libs/entities/product/product-entity.ts` — `insertProductSchema` (contains `stock`).
- `functions/private/stock/setup/index.ts` — full resync escape hatch.
- `libs/modules/cart/use-cases/update-cart-item-quantity.ts` — `waitUntil` KV refresh.
