---
status: Not Started
priority: P2
feature: 23-backoffice-dashboard
track: backoffice-app
depends_on: ["16-backoffice-auth-shell/step-03", "17-backoffice-design-system/step-02", "13-admin-dashboard-endpoint/step-01"]
blocks: []
---
# Step 01: Dashboard home screen

**Status:** Not Started · **Priority:** P2 · **Feature:** [Dashboard / Home Screen](./README.md)

## Technical goal
Build the backoffice home screen from the summary endpoint ([13](../13-admin-dashboard-endpoint/README.md)): stat cards for counts, a low-stock list, and a recent-orders list, each linking into the relevant screen — the post-login landing page.

## User impact
Admin staff land on an actionable overview: what's selling, what's low, what's new.

## Current state
- `GET /private/dashboard` returns counts + lowStock[] + recentOrders[] ([13 step-01](../13-admin-dashboard-endpoint/step-01-summary-endpoint.md)).
- The shell/design system and entity screens exist to link into.

## Technical steps
1. Set the home route (default authenticated landing) in the shell.
2. Render: stat cards (orders/products/users/collections counts); a low-stock widget (list from the summary, each linking to the stock adjust flow [22](../22-backoffice-stock/README.md)); a recent-orders widget (each linking to order detail [19](../19-backoffice-orders/README.md)).
3. Query the summary endpoint via TanStack Query; standard loading/empty/error states ([17 step-04](../17-backoffice-design-system/step-04-states-and-accessibility.md)).
4. Sparse-data handling: zero/empty aggregates render as intentional empty states ("No low-stock products", "No orders yet"), not broken widgets.
5. Keep it operational — counts + short lists + links; no charts/BI ([13](../13-admin-dashboard-endpoint/README.md)/§4 scope).

## Dependencies
**Depends on:** [16 step-03](../16-backoffice-auth-shell/step-03-app-shell-nav-layout.md), [17 step-02](../17-backoffice-design-system/step-02-data-table-component.md), [13 step-01](../13-admin-dashboard-endpoint/step-01-summary-endpoint.md).
**Blocks:** None.

## Implementation notes
- One summary call powers the whole screen (the endpoint is designed for that) — avoid fanning out to many list endpoints on the home page.
- Deep links make the dashboard a launchpad, not a dead end — every widget should go somewhere useful.
- Make empty states first-class; a fresh store is the first thing a new operator sees.

## Acceptance criteria
- [ ] The home screen renders counts, low-stock, and recent orders from the single summary endpoint.
- [ ] Widgets deep-link into stock and order screens.
- [ ] Loading/empty/error and sparse-data states are handled and look intentional.
- [ ] No analytics/charts beyond the operational summary.

## References
- [13](../13-admin-dashboard-endpoint/README.md) — summary endpoint + payload.
- [17 step-04](../17-backoffice-design-system/step-04-states-and-accessibility.md) — states.
- [19](../19-backoffice-orders/README.md), [22](../22-backoffice-stock/README.md) — deep-link targets.
