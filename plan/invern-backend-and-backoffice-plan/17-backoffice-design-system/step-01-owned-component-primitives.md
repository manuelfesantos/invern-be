---
status: Not Started
priority: P0
feature: 17-backoffice-design-system
track: backoffice-app
depends_on: ["15-backoffice-scaffolding/step-01"]
blocks: ["17-backoffice-design-system/step-02", "17-backoffice-design-system/step-03", "17-backoffice-design-system/step-04"]
---
# Step 01: Owned component primitives (shadcn-style)

**Status:** Not Started · **Priority:** P0 · **Feature:** [Shared Design System & Data-Table Layer](./README.md)

## Technical goal
Establish the in-repo, owned component library (Radix UI primitives + Tailwind, copied and customized — the shadcn/ui pattern) with the core primitives every screen needs, plus the design tokens/theme that unify them.

## User impact
None directly; every subsequent screen inherits a consistent, accessible visual language from these.

## Current state
- Post [15](../15-backoffice-scaffolding/README.md): Vite + React + TS + Tailwind with a base token setup, but no components.
- The brief (§14) specifies the shadcn/ui pattern explicitly: Radix primitives + Tailwind, copied in and customized rather than an opaque dependency.

## Technical steps
1. Set up the shadcn/ui approach: the component-adding workflow (CLI or manual), a `components/ui/` directory of owned primitives, and the `cn()`/class-variance-authority utilities for variant styling.
2. Extend the Tailwind theme with the design tokens (colors incl. semantic states — primary/destructive/muted/success/warning, spacing, radius, typography) so components theme consistently; support a sensible default and leave room for dark mode if wanted (don't build it unless asked).
3. Build the core primitives (each accessible via Radix where applicable): Button (variants: primary/secondary/destructive/ghost), Input, Textarea, Select, Checkbox/Switch, Label, Dialog/Modal, DropdownMenu, Toast (+ a toast provider/hook), Badge/Tag (for statuses like order/fulfillment state), Tooltip, Card, and a confirmation-dialog helper (for destructive actions like delete/cancel).
4. Document usage: a short components README (or a lightweight Storybook if the team wants it — optional) showing each primitive and its variants, so entity screens compose rather than restyle.
5. Bake in accessibility from Radix (focus trapping in dialogs, ARIA on menus/toasts) and add visible focus styles in the theme — the runtime a11y baseline is [step-04](./step-04-states-and-accessibility.md), but primitives should be accessible from the start.

## Dependencies
**Depends on:** [15 step-01](../15-backoffice-scaffolding/step-01-repo-vite-react-ts-tailwind.md).
**Blocks:** [step-02](./step-02-data-table-component.md), [step-03](./step-03-forms-layer.md), [step-04](./step-04-states-and-accessibility.md), and all entity screens.

## Implementation notes
- **Own the components** (copy-in), don't wrap an opaque UI kit — the brief is explicit, and owned components let every entity screen share exactly one table/form/modal implementation that the team controls.
- The **confirmation dialog** primitive is load-bearing for the destructive-action requirement (delete product, cancel order, delete user) — build it well and make it the standard for all destructive actions ([§14] wants meaningful handling of destructive flows).
- Status **Badge** variants map to real backend enums (order `isCanceled`, fulfillment `processing/shipped/delivered/canceled`, payment `state`) — define the mapping once here so orders/stock screens reuse it.
- Keep primitives unopinionated about data; they're presentational. Data-binding lives in the table/forms layers.

## Acceptance criteria
- [ ] An owned `components/ui/` library exists with the core primitives (button, input, select, checkbox/switch, dialog, dropdown, toast, badge, tooltip, card, confirm-dialog).
- [ ] The Tailwind theme defines semantic design tokens used consistently by the primitives.
- [ ] Primitives are accessible (Radix behaviors, visible focus) out of the box.
- [ ] A confirmation-dialog primitive exists and is the standard for destructive actions.
- [ ] Usage is documented so screens compose without restyling.

## References
- Brief §14 — the shadcn/ui + owned-library requirement.
- [15 step-01](../15-backoffice-scaffolding/step-01-repo-vite-react-ts-tailwind.md) — Tailwind/token base to extend.
- `db/schema.ts` — the status enums the Badge variants map to.
- [step-04](./step-04-states-and-accessibility.md) — the a11y baseline these feed.
