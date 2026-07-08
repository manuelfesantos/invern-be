# 23 — Dashboard / Home Screen

**Status:** Not Started · **Priority:** P2 · **Track:** Backoffice App

## Summary
The backoffice home screen: an at-a-glance operational overview backed by the summary endpoint ([13](../13-admin-dashboard-endpoint/README.md)) — entity counts, low-stock items, and recent orders — with quick links into the relevant screens. It's the landing page after login.

## Why this matters
A useful home screen orients staff the moment they log in (what needs attention today) instead of dropping them on an empty page. It's P2 because the entity screens deliver the core value; the dashboard is a convenience layer that depends on all of them plus the summary endpoint.

## Goals — what "done" looks like
- A home screen showing the summary payload ([13](../13-admin-dashboard-endpoint/README.md)): counts, low-stock list, recent orders.
- Quick navigation from each widget into the relevant screen (low-stock → stock; recent orders → order detail).
- Consistent loading/empty/error states; graceful when data is sparse (new store).

## User / business impact
Admin staff: a fast operational overview on login. Shoppers: none.

## In scope / Out of scope
**In scope:** the home/dashboard screen backed by the summary endpoint, with deep links.
**Out of scope:** analytics/BI, charts, time-series (§4 and [13](../13-admin-dashboard-endpoint/README.md)'s scope guard); the summary endpoint itself ([13](../13-admin-dashboard-endpoint/README.md)).

## Dependencies
**Depends on:** [16](../16-backoffice-auth-shell/README.md), [17](../17-backoffice-design-system/README.md), [13](../13-admin-dashboard-endpoint/README.md) (summary endpoint). Deep links target the entity screens (18–22).
**Blocks:** None (final leaf).

## Steps
| # | Step | Priority | Status | Depends on |
|---|---|---|---|---|
| 01 | [Dashboard home screen](./step-01-dashboard-home-screen.md) | P2 | Not Started | 16-backoffice-auth-shell/step-03, 17-backoffice-design-system/step-02, 13-admin-dashboard-endpoint/step-01 |

## Key risks
- **Scope creep into analytics.** Keep it to the operational summary; resist adding charts/BI that [13](../13-admin-dashboard-endpoint/README.md) and §4 exclude.
- **Sparse-data ugliness.** A brand-new store has near-empty aggregates; the screen must look intentional when counts are zero.

## Relevant existing code / references
- [13](../13-admin-dashboard-endpoint/README.md) — the summary endpoint + payload shape.
- [17 step-04](../17-backoffice-design-system/step-04-states-and-accessibility.md) — states for sparse/loading/error.
- Entity screens [18](../18-backoffice-catalog/README.md)–[22](../22-backoffice-stock/README.md) — deep-link targets.
