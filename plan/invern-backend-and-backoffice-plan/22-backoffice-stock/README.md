# 22 — Stock Management UI

**Status:** Not Started · **Priority:** P1 · **Track:** Backoffice App

## Summary
The backoffice screens for stock: an overview/low-stock view and a safe adjust-stock flow that writes through the correct tri-store path ([03](../03-payment-stock-integrity/README.md)). Stock is deliberately separated from the product edit form (which must not touch stock) because it lives in three stores (D1, KV, R2) that only stay consistent when written through the sanctioned path.

## Why this matters
Stock is money-sensitive and, in this system, uniquely fragile: three stores must agree, and the naive "edit stock in the product form" path desyncs them ([03](../03-payment-stock-integrity/README.md)). The backoffice needs a stock UI that (a) shows staff what needs attention (low/out of stock) and (b) adjusts stock only through the safe write path, so the tool doesn't itself create the drift the backend just fixed.

## Goals — what "done" looks like
- A stock overview: current stock per product with low/out-of-stock highlighting, filterable/sortable, reusing the shared low-stock threshold ([13](../13-admin-dashboard-endpoint/README.md)).
- A safe adjust-stock flow (set/adjust) that calls the unified stock endpoint/path from [03 step-02](../03-payment-stock-integrity/step-02-tri-store-stock-consistency.md) — never the product update.
- Clear feedback and consistency (the shown number is the real, synced number).

## User / business impact
Admin staff: monitor and correct inventory safely. Shoppers: accurate availability (no oversell/false-out-of-stock from admin edits).

## In scope / Out of scope
**In scope:** stock overview/low-stock screen; safe adjust-stock UI.
**Out of scope:** multi-warehouse inventory (§4); the stock write-path backend work ([03](../03-payment-stock-integrity/README.md)); product content editing ([18](../18-backoffice-catalog/README.md)).

## Dependencies
**Depends on:** [16](../16-backoffice-auth-shell/README.md), [17](../17-backoffice-design-system/README.md), [03 step-02](../03-payment-stock-integrity/step-02-tri-store-stock-consistency.md) (the safe write path + endpoint), product list data ([18](../18-backoffice-catalog/README.md)/[07](../07-pagination-filtering-envelope/README.md)).
**Blocks:** None.

## Steps
| # | Step | Priority | Status | Depends on |
|---|---|---|---|---|
| 01 | [Stock overview & low-stock view](./step-01-stock-overview.md) | P1 | Not Started | 16-backoffice-auth-shell/step-03, 17-backoffice-design-system/step-02 |
| 02 | [Safe adjust-stock flow](./step-02-adjust-stock-flow.md) | P1 | Not Started | step-01, 03-payment-stock-integrity/step-02 |

## Key risks
- **Writing stock the wrong way.** If the adjust flow hits the product update instead of the unified stock path, it desyncs D1/KV/R2 — the exact bug [03](../03-payment-stock-integrity/README.md) fixes. The UI must use only the sanctioned endpoint.
- **Stale reads.** Stock changes elsewhere (checkout reservations) between view and adjust; the flow should re-read/confirm and tolerate concurrent changes.

## Relevant existing code / references
- [03 step-02](../03-payment-stock-integrity/step-02-tri-store-stock-consistency.md) — the unified stock write path/endpoint this UI must use.
- `apps/backend/src/routes/private/stock.ts` — existing stock routes (get is local-only today; the adjust endpoint comes from [03](../03-payment-stock-integrity/README.md)).
- `libs/db/product/actions/select.ts` — product stock reads (list/low-stock source).
- [13 step-01](../13-admin-dashboard-endpoint/step-01-summary-endpoint.md) — the shared low-stock threshold.
