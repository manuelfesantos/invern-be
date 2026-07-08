---
status: Not Started
priority: P1
feature: 20-backoffice-commerce-config
track: backoffice-app
depends_on: ["16-backoffice-auth-shell/step-03", "17-backoffice-design-system/step-02", "17-backoffice-design-system/step-03"]
blocks: ["20-backoffice-commerce-config/step-02", "20-backoffice-commerce-config/step-03"]
---
# Step 01: Countries & currencies screens

**Status:** Not Started · **Priority:** P1 · **Feature:** [Commerce Configuration UI](./README.md)

## Technical goal
Build list + create/edit/delete screens for currencies and countries, respecting their relationship (a country references a currency) and warning about cascade deletes.

## User impact
Admin staff manage which currencies and countries the store supports, and their settings (symbol, rate-to-euro, locale).

## Current state
- `GET/POST /private/currencies` + `/{code}` (GET/PUT/DELETE), same for countries — exist; paginated after [07 step-02](../07-pagination-filtering-envelope/step-02-retrofit-list-endpoints.md).
- `insertCurrencySchema` (code, name, symbol, rateToEuro, stripeName); `insertCountrySchema` (code, name, locale, currencyCode → currency). Countries reference currencies; currency delete cascades to countries; country delete cascades to taxes + shipping-rate-to-country (`db/schema.ts`).

## Technical steps
1. Currencies: list (code, name, symbol, rateToEuro) + create/edit form (mirror `insertCurrencySchema`). Note `rateToEuro` is manually maintained (no live FX — §4); label it as such.
2. Countries: list (code, name, locale, currency) + create/edit form (mirror `insertCountrySchema`) with a **currency select** populated from currencies (a country needs an existing currency).
3. Delete guards: currency delete → warn it cascades to countries (and thus their taxes/shipping coverage); country delete → warn it cascades to taxes + shipping-rate-country links. Show the confirmation with the real consequence (ideally counts of dependents).
4. Creation ordering UX: guide users to create a currency before a country that needs it (empty currency select → prompt to add a currency first).
5. Standard states + destructive confirmation throughout.

## Dependencies
**Depends on:** [16 step-03](../16-backoffice-auth-shell/step-03-app-shell-nav-layout.md), [17 step-02](../17-backoffice-design-system/step-02-data-table-component.md), [17 step-03](../17-backoffice-design-system/step-03-forms-layer.md).
**Blocks:** [step-02](./step-02-taxes-screens.md) (taxes need countries), [step-03](./step-03-shipping-screens.md) (rate-country assignment needs countries).

## Implementation notes
- **Cascade warnings must be specific.** Deleting a currency can wipe countries and everything hanging off them — a generic "are you sure?" undersells it. Fetch/display the dependent counts if feasible.
- `rateToEuro` is manual; make the field's meaning clear (it's the FX rate the store uses; there's no live feed) to avoid staff expecting auto-updates.
- Currency/country codes are primary keys (not surrogate ids) — editing a code is effectively delete+recreate; either disallow code edits or handle them explicitly.

## Acceptance criteria
- [ ] Currencies and countries have list + create/edit/delete screens mirroring their schemas.
- [ ] Country form's currency select is populated and required; creation ordering is guided.
- [ ] Delete confirmations warn about the specific cascades (ideally with dependent counts).
- [ ] `rateToEuro` is labeled as manually maintained.
- [ ] Standard states + confirmation applied.

## References
- `apps/backend/src/routes/private/currencies.ts`, `countries.ts` — endpoints.
- `libs/entities/currency/**`, `country/**` — schemas.
- `db/schema.ts` — cascade relationships.
- [17 step-03](../17-backoffice-design-system/step-03-forms-layer.md) — forms layer.
