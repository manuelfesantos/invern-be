---
status: Not Started
priority: P1
feature: 20-backoffice-commerce-config
track: backoffice-app
depends_on: ["20-backoffice-commerce-config/step-01", "10-taxes-admin-surface/step-02"]
blocks: []
---
# Step 02: Taxes screens

**Status:** Not Started · **Priority:** P1 · **Feature:** [Commerce Configuration UI](./README.md)

## Technical goal
Build the taxes management UI over the new `/private/taxes` API ([10](../10-taxes-admin-surface/README.md)): list/create/edit/delete tax rates by country, with the corrected rate representation.

## User impact
Admin staff view and correct per-country tax rates — impossible before Track B, and critical for charging customers correctly.

## Current state
- `/private/taxes` CRUD exists after [10 step-02](../10-taxes-admin-surface/step-02-taxes-routes.md), with the rate-storage fix and country filtering.
- Countries exist ([step-01](./step-01-countries-currencies-screens.md)); a tax references a country.

## Technical steps
1. Decide presentation (per [10](../10-taxes-admin-surface/README.md)'s standalone-API decision + open question 3): either a standalone Taxes screen (list filterable by country) or taxes nested within the country detail. Recommended: a standalone Taxes list with a country filter, plus a "taxes" section shown on the country screen for convenience — both hit the same API.
2. Taxes list via `<DataTable>` (name, country, rate) with a country filter.
3. Create/edit form mirroring the tax schema: name, country (select), rate — displayed in the corrected unit ([10 step-01](../10-taxes-admin-surface/step-01-tax-module-and-rate-fix.md)); if stored as a fraction, present as a percentage in the UI and convert.
4. Delete with confirmation; note that deleting a country's last tax changes future pricing for that country (warn) but doesn't alter historical orders.
5. Respect multi-tax-per-country if [10 step-01](../10-taxes-admin-surface/step-01-tax-module-and-rate-fix.md) kept it (the schema allows many); the UI should list all of a country's taxes.

## Dependencies
**Depends on:** [step-01](./step-01-countries-currencies-screens.md) (countries), [10 step-02](../10-taxes-admin-surface/step-02-taxes-routes.md) (API).
**Blocks:** None.

## Implementation notes
- **Rate unit presentation must match storage.** [10 step-01](../10-taxes-admin-surface/step-01-tax-module-and-rate-fix.md) fixes how the rate is stored (likely a fraction like 0.23); show it as a human percentage (23%) and convert on submit — mismatching the unit mischarges customers.
- Warn on removing a country's only tax (future prices become untaxed for that country).
- If taxes are also shown on the country screen, both views must invalidate the same query so they stay consistent.

## Acceptance criteria
- [ ] Taxes list (filterable by country) + create/edit/delete work against `/private/taxes`.
- [ ] Rate is presented as a percentage and converted to the stored unit correctly.
- [ ] Country select is required and validated.
- [ ] Delete warns about future-pricing impact; multi-tax-per-country is handled per the backend decision.
- [ ] Standard states + confirmation applied.

## References
- [10](../10-taxes-admin-surface/README.md) — taxes API + rate representation.
- `libs/entities/tax/tax-entity.ts` — tax schema.
- [step-01](./step-01-countries-currencies-screens.md) — countries the taxes attach to.
