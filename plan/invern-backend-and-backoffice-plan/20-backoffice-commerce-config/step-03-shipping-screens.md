---
status: Not Started
priority: P1
feature: 20-backoffice-commerce-config
track: backoffice-app
depends_on: ["20-backoffice-commerce-config/step-01", "08-shipping-admin-endpoints/step-03"]
blocks: []
---
# Step 03: Shipping methods & rates screens

**Status:** Not Started · **Priority:** P1 · **Feature:** [Commerce Configuration UI](./README.md)

## Technical goal
Build the shipping management UI over the new shipping admin API ([08](../08-shipping-admin-endpoints/README.md)): methods (list/create/edit/delete), their rates (weight band, price, delivery time), and assigning countries to each rate.

## User impact
Admin staff define how the store ships — the methods offered, their price by weight band and delivery time, and which countries each rate covers.

## Current state
- Shipping admin API exists after [08](../08-shipping-admin-endpoints/README.md): methods CRUD, rates CRUD (with band validation), and rate-to-country assignment.
- Countries exist ([step-01](./step-01-countries-currencies-screens.md)); rates reference a method and cover countries.

## Technical steps
1. Methods: list + create/edit/delete (a method is essentially a name). Method detail shows its rates.
2. Rates (nested under a method, matching [08 step-02](../08-shipping-admin-endpoints/step-02-shipping-rate-admin.md)'s chosen structure): create/edit with price (cents→currency), weight band (min/max, with client-side `min<=max` + overlap hints mirroring the backend validation), delivery time (business days). List a method's rates clearly by band.
3. Country assignment: for each rate, a multi-select of countries (from [step-01](./step-01-countries-currencies-screens.md)) that saves the full set (replace semantics, matching [08 step-03](../08-shipping-admin-endpoints/step-03-rate-country-assignment.md)). Warn when a rate has no countries (unusable at checkout).
4. Delete guards: deleting a method removes its rates (and their country links); deleting a rate removes its country links — confirm with the consequence.
5. Guide creation order: method → rates → countries; a rate needs a parent method, a country assignment needs countries to exist.
6. Standard states + confirmation.

## Dependencies
**Depends on:** [step-01](./step-01-countries-currencies-screens.md) (countries), [08 step-03](../08-shipping-admin-endpoints/step-03-rate-country-assignment.md) (API).
**Blocks:** None.

## Implementation notes
- **Mirror the band validation** ([08 step-02](../08-shipping-admin-endpoints/step-02-shipping-rate-admin.md)) client-side: `min<=max`, non-negative, and surface overlap/gap hints — a gapped band means some cart weights get no rate at checkout. Show the method's bands together so gaps/overlaps are visible.
- Country multi-select uses replace semantics (save the whole set) to match the backend; warn on an empty set (silently disables the rate at checkout).
- Price in cents, weight in the base unit — reuse the shared money/units helpers.
- This is the most relational screen (method→rates→countries); lean on the nested structure to keep it comprehensible.

## Acceptance criteria
- [ ] Methods and their rates are fully manageable (CRUD) with band/price/delivery-time fields.
- [ ] Client-side band validation mirrors the backend; overlaps/gaps are surfaced.
- [ ] Rate→country assignment uses a multi-select with replace semantics; empty-set warned.
- [ ] Delete guards warn about cascades (method→rates→countries).
- [ ] Creation ordering is guided; standard states + confirmation applied.

## References
- [08](../08-shipping-admin-endpoints/README.md) — shipping admin API (methods, rates, country assignment).
- `db/schema.ts` — shipping tables + cascades.
- [step-01](./step-01-countries-currencies-screens.md) — countries the rates cover.
- [17 step-03](../17-backoffice-design-system/step-03-forms-layer.md) — forms + money/units helpers.
