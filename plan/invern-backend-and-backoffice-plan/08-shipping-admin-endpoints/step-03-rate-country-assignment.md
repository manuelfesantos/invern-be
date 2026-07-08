---
status: Not Started
priority: P0
feature: 08-shipping-admin-endpoints
track: backend-api-completion
depends_on: ["08-shipping-admin-endpoints/step-02"]
blocks: ["08-shipping-admin-endpoints/step-04"]
---
# Step 03: Rate-to-country assignment endpoints

**Status:** Not Started · **Priority:** P0 · **Feature:** [Shipping Admin Endpoints](./README.md)

## Technical goal
Expose endpoints to assign and unassign countries to a shipping rate (managing the `shippingRatesToCountries` join), over the existing rate-to-countries operation, so staff control where each rate applies.

## User impact
Admin staff can say "this rate is available for these countries," which is what makes a rate selectable at checkout for a given destination.

## Current state
- The operation exists but is unused for admin: `insert-shipping-rate-in-countries.ts` (`libs/db/shipping/rate/operations/`).
- `shippingRatesToCountriesTable` is a join `{ shippingRateId, countryCode }` with a composite PK (`db/schema.ts`), cascading on delete of either side.
- Checkout matches a rate to a destination via `rate.countryCodes.includes(country.code)` (`getSelectedShippingMethod`/`getShippingMethods`), so this join is exactly what gates rate availability by country.

## Technical steps
1. Decide the assignment API shape (pick one, document):
   - **Sub-resource:** `PUT /private/shipping/rates/{id}/countries` with a body `{ countryCodes: string[] }` that **replaces** the rate's country set (simplest for the UI — a multi-select that saves the whole list), plus optionally `POST`/`DELETE` for single add/remove.
   - **Individual:** `POST /private/shipping/rates/{id}/countries/{countryCode}` and `DELETE` the same. More granular, chattier.
   - Recommended: the **replace-set `PUT`** (matches how a country multi-select in [20](../20-backoffice-commerce-config/README.md) will behave), with the DB operation doing a diff (insert missing, delete removed) or a delete-all-then-insert within a batch.
2. Add an admin use-case `setRateCountries(rateId, countryCodes)` wrapping the existing operation (extend it if it currently only inserts — a replace needs delete-then-insert or a diff).
3. Validate: the rate exists; each `countryCode` references an existing country (`countriesTable`); dedupe the input.
4. Return the rate's resulting country set (or the full rate with countries) so the UI can confirm.
5. Ensure the read side exposes a rate's current countries (the rate detail from [step-02](./step-02-shipping-rate-admin.md) should include `countryCodes`).

## Dependencies
**Depends on:** [step-02](./step-02-shipping-rate-admin.md) (rates exist).
**Blocks:** [step-04](./step-04-shipping-swagger-and-tests.md).

## Implementation notes
- **Replace-set semantics are transactional-sensitive:** delete-all-then-insert must be one batch (`runBatchOperation`) so a failure can't leave a rate with zero countries mid-update. Use the existing batch operation utility.
- Validate country codes against `countriesTable` to avoid orphan join rows pointing at non-existent countries (the FK cascade protects deletes, but a bad insert code should 400, not silently fail).
- A rate with **no** countries is effectively unusable at checkout — consider warning (not necessarily blocking) when the set is emptied, since it silently removes the rate from all checkouts.

## Acceptance criteria
- [ ] An admin can set the full country list for a rate in one call (replace semantics), transactionally.
- [ ] Invalid/non-existent country codes are rejected with `400`; duplicates are deduped.
- [ ] Rate detail includes the current `countryCodes`.
- [ ] Emptying a rate's country set is handled deliberately (warned/documented).
- [ ] Swagger + tests in [step-04](./step-04-shipping-swagger-and-tests.md).

## References
- `libs/db/shipping/rate/operations/insert-shipping-rate-in-countries.ts` — the operation to wrap/extend.
- `db/schema.ts` — `shippingRatesToCountriesTable` (composite PK, cascades).
- `libs/modules/order/use-cases/checkout/index.ts`, `libs/modules/shipping/use-cases/method/get-shipping-methods.ts` — how `countryCodes` gates selection.
- `libs/db/generics/operations/batch.ts` — batch for transactional replace.
