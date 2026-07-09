# 17 — Shared Design System & Data-Table Layer

**Status:** Done · **Priority:** P0 · **Track:** Backoffice App

## Summary
Build the owned component library every entity screen shares — the shadcn/ui pattern (Radix UI primitives + Tailwind, copied in and customized rather than pulled in as an opaque dependency): buttons, inputs, selects, modal/dialog, toast, and consistent loading/empty/error states; a headless data-table layer (TanStack Table) bound to the backend's pagination envelope; and a forms layer (React Hook Form + Zod) whose schemas mirror the backend's validation. This is what makes "as good of code as possible" structural — every screen reuses these instead of reinventing table/form/modal/state handling.

## Why this matters
Without a shared component and table/form layer, each of the ~6 entity areas reinvents its own table pagination, form validation, modals, and error handling — inconsistent, buggy, and slow to build. The brief (§14) makes this explicit: one component library used by every screen, consistent loading/empty/error states everywhere, accessibility by default, and form validation mirroring the backend. This feature delivers that substrate; features 18–23 consume it.

## Goals — what "done" looks like
- An owned primitives library (shadcn-style: Radix + Tailwind, in-repo and editable) covering button, input, select, checkbox, dialog/modal, toast, badge, etc.
- A `<DataTable>` bound to the pagination envelope ([07](../07-pagination-filtering-envelope/README.md)) with server-side pagination/sort/filter, consistent across entities.
- A forms layer (RHF + Zod) with reusable field components and schemas mirroring the backend's Zod ([mirroring §14]).
- Standard loading/empty/error state components used by every data view — never a blank screen or an unhandled rejection shown to a non-technical user.
- Accessibility baked in (keyboard nav, focus states, semantic markup).

## User / business impact
Admin staff: a consistent, polished, accessible experience across every screen. Engineers: build entity screens by composition, not from scratch.

## In scope / Out of scope
**In scope:** owned primitives; the data-table layer; the forms layer; standard states; the accessibility baseline.
**Out of scope:** the entity screens themselves (18–23, which consume this); the app shell ([16 step-03](../16-backoffice-auth-shell/step-03-app-shell-nav-layout.md)), though it may adopt these primitives.

## Dependencies
**Depends on:** [15](../15-backoffice-scaffolding/README.md) (Tailwind, TS, data layer), [07](../07-pagination-filtering-envelope/README.md) (the envelope the table binds to). The forms layer benefits from the backend's `libs/entities/**` Zod shapes.
**Blocks:** every entity screen ([18](../18-backoffice-catalog/README.md)–[23](../23-backoffice-dashboard/README.md)).

## Steps
| # | Step | Priority | Status | Depends on |
|---|---|---|---|---|
| 01 | [Owned component primitives (shadcn-style)](./step-01-owned-component-primitives.md) | P0 | Done | 15-backoffice-scaffolding/step-01 |
| 02 | [Data-table layer bound to the pagination envelope](./step-02-data-table-component.md) | P0 | Done | step-01, 15-backoffice-scaffolding/step-04, 07-pagination-filtering-envelope/step-02 |
| 03 | [Forms layer (RHF + Zod mirroring the backend)](./step-03-forms-layer.md) | P0 | Done | step-01 |
| 04 | [Standard states & accessibility baseline](./step-04-states-and-accessibility.md) | P0 | Done | step-01 |

## Key risks
- **Reinvention creep.** If entity screens bypass these components "just this once," consistency erodes. Make the shared components genuinely ergonomic so they're the path of least resistance, and lint/review against one-off tables/forms.
- **Backend/client validation divergence.** If form schemas drift from the backend Zod, client and server disagree about what's valid. Mirror deliberately (ideally derive from the same shapes) and note it can't be perfectly automatic across repos.

## Relevant existing code / references
- `libs/entities/**` — the Zod schemas the forms mirror (e.g. `insertProductSchema`, `insertCurrencySchema`, `loginBodySchema`).
- [07](../07-pagination-filtering-envelope/README.md) — the `{ data, page, pageSize, total }` envelope + sort/filter contract the table binds to.
- [15 step-04](../15-backoffice-scaffolding/step-04-api-client-integration.md) — the TanStack Query data layer the table/forms call through.
- Brief §14 — the concrete code-quality standards this feature operationalizes.
- shadcn/ui + Radix UI + TanStack Table — the external patterns/libraries used.
