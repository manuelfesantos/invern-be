---
status: Not Started
priority: P0
feature: 17-backoffice-design-system
track: backoffice-app
depends_on: ["17-backoffice-design-system/step-01"]
blocks: ["18-backoffice-catalog/step-02", "20-backoffice-commerce-config/step-01"]
---
# Step 03: Forms layer (RHF + Zod mirroring the backend)

**Status:** Not Started · **Priority:** P0 · **Feature:** [Shared Design System & Data-Table Layer](./README.md)

## Technical goal
Build the reusable forms layer — React Hook Form + Zod with owned field components — and establish the convention that form schemas mirror the backend's validation, so client and server never disagree about what's valid.

## User impact
Admin staff get consistent forms with inline validation and clear errors on every create/edit screen; invalid input is caught before a wasted round-trip.

## Current state
- Primitives exist ([step-01](./step-01-owned-component-primitives.md)).
- The backend defines insert/validation schemas in Zod (`libs/entities/**`, e.g. `insertProductSchema`, `insertCurrencySchema`, `insertCountrySchema`, shipping/tax schemas from Track B) — the client should mirror these shapes.

## Technical steps
1. Set up React Hook Form + Zod resolver as the form standard. Build owned field components that wrap the primitives ([step-01](./step-01-owned-component-primitives.md)) with label + error display + RHF wiring: TextField, TextareaField, SelectField, CheckboxField, NumberField (for cents/weights), etc.
2. Establish the schema-mirroring convention: for each entity form, define a Zod schema matching the backend's insert/update schema (field names, required/optional, constraints). Where the generated types ([14](../14-api-contract-typed-client/README.md)) give the *shape*, the Zod schema gives *validation* — keep both aligned. Document that this mirroring is manual across repos and must be updated when the backend schema changes (the generated types will flag shape drift at compile time; validation drift needs discipline).
3. Standard form patterns: a `<Form>` wrapper handling submit → mutation → success toast / error surfacing (mapping the API error envelope to field or form-level errors), pending/disabled state during submit, and dirty-state tracking (warn on navigate-away with unsaved changes).
4. Money/units helpers: consistent handling of `priceInCents`/weights (display in currency/grams, store in cents/base units) reused across product/shipping/currency forms — mirror the backend's integer-cents convention.
5. Reusable submit/cancel affordances and destructive-confirm integration (delete from within an edit form uses the confirm-dialog).
6. Document the pattern with one worked example (e.g. a currency form) so entity screens follow it.

## Dependencies
**Depends on:** [step-01](./step-01-owned-component-primitives.md). Mirrors `libs/entities/**`; benefits from [14](../14-api-contract-typed-client/README.md) types.
**Blocks:** every create/edit form (catalog [18](../18-backoffice-catalog/README.md), commerce config [20](../20-backoffice-commerce-config/README.md), etc.).

## Implementation notes
- **Mirror the backend Zod deliberately.** The brief (§14) wants client and server to agree on validity. Perfect automatic sharing across two repos is hard; the pragmatic path is: generated **types** for shape (compile-time drift detection) + hand-mirrored **Zod** for validation, with a note to update when the backend changes. Consider extracting shared schemas to a package later if it proves worth it.
- Handle the backend's **error envelope** consistently: map validation errors to the offending fields where possible, and show a form-level error otherwise — never swallow an error into a blank screen (ties to [step-04](./step-04-states-and-accessibility.md)).
- Integer-cents discipline: forms display human units but submit the backend's integer representation; get this wrong and prices/weights are off by 100×. Centralize the conversion.
- Unsaved-changes warning is a small touch that prevents real data loss on these admin forms.

## Acceptance criteria
- [ ] RHF + Zod is the form standard with owned field components (text/textarea/select/checkbox/number) wired for label + inline errors.
- [ ] Entity form schemas mirror the backend Zod; the mirroring/update convention is documented.
- [ ] The `<Form>` wrapper handles submit→mutation→toast/error, pending state, and dirty tracking (navigate-away warning).
- [ ] Money/units conversion (cents/grams) is centralized and reused.
- [ ] API error-envelope mapping to field/form errors is standardized (no swallowed errors).

## References
- `libs/entities/**` — the Zod schemas to mirror (`insertProductSchema`, `insertCurrencySchema`, etc.).
- [14](../14-api-contract-typed-client/README.md) — generated types (shape) complementing the mirrored validation.
- [step-01](./step-01-owned-component-primitives.md) — primitives the fields wrap.
- [step-04](./step-04-states-and-accessibility.md) — error-state handling.
