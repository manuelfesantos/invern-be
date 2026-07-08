---
status: Not Started
priority: P0
feature: 16-backoffice-auth-shell
track: backoffice-app
depends_on: ["16-backoffice-auth-shell/step-02"]
blocks: ["18-backoffice-catalog/step-01", "19-backoffice-orders/step-01", "20-backoffice-commerce-config/step-01", "21-backoffice-users/step-01", "22-backoffice-stock/step-01", "23-backoffice-dashboard/step-01"]
---
# Step 03: Application shell: nav & layout

**Status:** Not Started · **Priority:** P0 · **Feature:** [Auth & Application Shell](./README.md)

## Technical goal
Build the persistent app shell — navigation (sidebar/menu grouping the entity areas), header (current admin, logout), and the page-content layout container — that every authenticated screen renders into.

## User impact
Admin staff get a coherent, navigable app frame with consistent placement of navigation, identity, and actions across every screen.

## Current state
- Auth + protected routing exist ([step-01](./step-01-login-flow.md)/[step-02](./step-02-protected-routing-and-refresh.md)).
- No layout/nav yet; entity screens (18–23) need a frame to live in.

## Technical steps
1. Build the layout: a responsive sidebar (or top nav) listing the management areas — Dashboard, Catalog (Products/Collections), Orders, Users, Commerce Config (Countries/Currencies/Taxes/Shipping), Stock — grouped sensibly, with active-route highlighting via React Router.
2. Header: current admin identity (name/email from auth state), a logout action ([step-02](./step-02-protected-routing-and-refresh.md)), and space for page-level actions/breadcrumbs.
3. Content container: a consistent page wrapper (title area, actions slot, content) that entity screens fill, so every screen has the same structure without re-implementing it.
4. Nav should reflect only what exists/enabled; where a section's backend feature isn't ready, either hide it or show a clearly-disabled state (don't link to broken screens).
5. Responsive + keyboard-navigable (accessibility baseline from brief §14 — collapsible nav on small screens, focus management, skip-to-content). The full a11y pass is [17 step-04](../17-backoffice-design-system/step-04-states-and-accessibility.md), but the shell must be accessible since it's on every page.
6. Use the design-system primitives ([17](../17-backoffice-design-system/README.md)) for shell chrome if available; otherwise keep the shell simple and refactor onto the DS.

## Dependencies
**Depends on:** [step-02](./step-02-protected-routing-and-refresh.md). Pairs with [17](../17-backoffice-design-system/README.md).
**Blocks:** every entity screen ([18](../18-backoffice-catalog/README.md)–[23](../23-backoffice-dashboard/README.md)) — they render inside this shell.

## Implementation notes
- Keep the nav data-driven (a config array of sections/routes) so adding an entity screen is a one-line change, not a shell rewrite.
- The shell is on every page — its accessibility and performance matter disproportionately; get focus order and landmark regions (`nav`, `main`, `header`) right.
- Don't over-design now; a clean, consistent frame beats an elaborate one. The design system ([17](../17-backoffice-design-system/README.md)) sets the visual language.
- Route structure should map to the feature areas so deep links work (e.g. `/orders/:id`, `/catalog/products/:id`).

## Acceptance criteria
- [ ] A responsive shell (nav + header + content container) wraps all authenticated routes with active-route highlighting.
- [ ] The header shows the current admin and a working logout.
- [ ] Nav is data-driven and reflects only available sections.
- [ ] The shell is keyboard-navigable with proper landmark regions and skip-to-content.
- [ ] Entity screens have a consistent page container to render into.

## References
- [step-02](./step-02-protected-routing-and-refresh.md) — auth state + logout the shell surfaces.
- [17](../17-backoffice-design-system/README.md) — component primitives + a11y baseline.
- Entity features [18](../18-backoffice-catalog/README.md)–[23](../23-backoffice-dashboard/README.md) — the routes the nav links to.
