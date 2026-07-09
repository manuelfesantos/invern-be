---
status: Done
priority: P0
feature: 17-backoffice-design-system
track: backoffice-app
depends_on: ["17-backoffice-design-system/step-01"]
blocks: []
---
# Step 04: Standard states & accessibility baseline

**Status:** Done · **Priority:** P0 · **Feature:** [Shared Design System & Data-Table Layer](./README.md)

## Technical goal
Provide the standard loading, empty, and error state components that every data view uses, plus the accessibility baseline (keyboard nav, focus management, semantic markup, error boundaries) so a non-technical user never sees a blank screen or an unhandled rejection.

## User impact
Admin staff always see a meaningful state — a spinner/skeleton while loading, a helpful empty state, a recoverable error with a retry — instead of blank screens or cryptic failures, and can operate the app by keyboard.

## Current state
- Primitives exist ([step-01](./step-01-owned-component-primitives.md)); the data layer surfaces loading/error via TanStack Query ([15 step-04](../15-backoffice-scaffolding/step-04-api-client-integration.md)).
- The brief (§14) requires consistent loading/empty/error states on every data view and accessible-by-default screens — this step makes that concrete.

## Technical steps
1. Build standard state components: `<LoadingState>` (spinner/skeleton variants for tables and forms), `<EmptyState>` (icon + message + optional primary action, e.g. "No products yet — create one"), and `<ErrorState>` (message + retry button, wired to TanStack Query's `refetch`).
2. Make the data-table ([step-02](./step-02-data-table-component.md)) and any query-backed view compose these by default, so no screen renders a bare blank or an unhandled promise rejection.
3. Add a top-level **error boundary** so a render exception shows a recoverable error UI, not a white screen; add a query-level error handler (global toast for unexpected failures) from [15 step-04](../15-backoffice-scaffolding/step-04-api-client-integration.md).
4. Accessibility baseline (per §14): ensure keyboard navigability of tables (row focus, action menus), modals (focus trap + restore — from Radix), and menus; visible focus indicators (from the theme); semantic HTML and ARIA where needed; run an automated a11y check (axe via a test or CI) and fix violations.
5. Handle the "non-technical user" error language: user-facing error messages should be plain and actionable, never raw API/stack text (map technical errors to friendly copy; log the detail).
6. Document the states + a11y expectations so every entity screen adopts them uniformly.

## Dependencies
**Depends on:** [step-01](./step-01-owned-component-primitives.md). Pairs with [step-02](./step-02-data-table-component.md)/[step-03](./step-03-forms-layer.md) and [15 step-04](../15-backoffice-scaffolding/step-04-api-client-integration.md).
**Blocks:** None formally, but every screen relies on these being the default.

## Implementation notes
- **No bare blank screens, ever** — this is an explicit §14 requirement and a non-technical-user necessity. Make the states the default composition in the table and query wrappers so a developer has to go out of their way to *not* handle them.
- Error messages for non-technical staff must be human ("Couldn't load orders — retry?"), with the technical detail logged, not shown.
- Accessibility is cheaper enforced continuously (the `jsx-a11y` lint from [15 step-02](../15-backoffice-scaffolding/step-02-tooling-and-ci-parity.md) + an axe check here) than audited at the end.
- Skeletons over spinners for tables/lists give a better perceived-performance feel; offer both.

## Acceptance criteria
- [ ] Reusable `<LoadingState>`, `<EmptyState>`, `<ErrorState>` components exist and are the default in the data-table and query-backed views.
- [ ] A top-level error boundary + global query-error handling prevent white screens and unhandled rejections.
- [ ] Tables, modals, and menus are keyboard-navigable with focus management and visible focus.
- [ ] An automated a11y check runs and passes on the core components/screens.
- [ ] User-facing errors are plain-language and actionable; technical detail is logged, not shown.

## References
- Brief §14 — consistent states + accessibility requirements.
- [15 step-04](../15-backoffice-scaffolding/step-04-api-client-integration.md) — global error handling to build on.
- [15 step-02](../15-backoffice-scaffolding/step-02-tooling-and-ci-parity.md) — `jsx-a11y` lint (static a11y counterpart).
- [step-02](./step-02-data-table-component.md), [step-03](./step-03-forms-layer.md) — the consumers of these states.
