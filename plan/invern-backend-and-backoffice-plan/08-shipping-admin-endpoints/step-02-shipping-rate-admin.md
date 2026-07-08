---
status: Not Started
priority: P0
feature: 08-shipping-admin-endpoints
track: backend-api-completion
depends_on: ["08-shipping-admin-endpoints/step-01"]
blocks: ["08-shipping-admin-endpoints/step-03"]
---
# Step 02: Shipping rate admin use-cases & routes

**Status:** Not Started · **Priority:** P0 · **Feature:** [Shipping Admin Endpoints](./README.md)

## Technical goal
Add admin use-cases and routes for full CRUD of shipping rates (price, weight band, delivery time, parent method) over the existing rate DB actions, with validation that prevents broken weight bands.

## User impact
Admin staff can define and adjust the rates within each shipping method — price, the weight range it applies to, and delivery time.

## Current state
- Rate DB actions exist, unused for admin: `getInsertShippingRateAction`, `getUpdateShippingRateAction`, `getDeleteShippingRateAction`, `getSelectShippingRateAction` (`libs/db/shipping/rate/actions/*`).
- `shippingRatesTable`: `{ id, priceInCents, minWeight, maxWeight, deliveryTime, shippingMethodId }` (`db/schema.ts`).
- Checkout selects a rate by matching cart weight against `[minWeight, maxWeight]` and the destination country (`getSelectedShippingMethod` in `checkout/index.ts`), so band correctness directly affects whether checkout finds a rate.

## Technical steps
1. Add rate insert/update Zod schemas (drizzle-zod over `shippingRatesTable`) in `libs/entities/shipping/**` if not present.
2. Add admin use-cases: `addShippingRate(body)`, `updateShippingRate(id, body)`, `deleteShippingRate(id)`, `getShippingRateById(id)`, and either a rates list under a method (`getRatesForMethod(methodId)`) or a paginated global list — decide based on the backoffice UX ([20](../20-backoffice-commerce-config/README.md) likely shows rates nested under a method).
3. Routes (mirror the method routes):
   - `functions/private/shipping/rates/index.ts` → list (by method / paginated) + create.
   - `functions/private/shipping/rates/[id]/index.ts` → detail + update + delete.
   - Alternatively nest as `functions/private/shipping/methods/[id]/rates/*` if rates are always method-scoped in the UI — pick one and be consistent; nested is more RESTful given the parent relationship. Document the choice.
4. Validation:
   - `minWeight <= maxWeight`, non-negative weights, non-negative `priceInCents`, positive `deliveryTime`.
   - Overlap/gap check within a method's rates: warn or reject overlapping bands (two rates covering the same weight makes selection ambiguous). At minimum, reject exact overlaps; document how gaps are handled (a cart weight in a gap yields no rate at checkout).
   - `shippingMethodId` must reference an existing method.
5. Return the created/updated rate; use the envelope for any list.

## Dependencies
**Depends on:** [step-01](./step-01-shipping-method-admin.md) (methods exist; rates hang off them).
**Blocks:** [step-03](./step-03-rate-country-assignment.md).

## Implementation notes
- **Band validation is the value-add here.** The DB actions will happily store overlapping/gapped bands; the checkout selection logic then silently misbehaves. Put the validation in the use-case so both create and update enforce it.
- Deleting a rate cascades to its `shippingRatesToCountries` rows (schema `onDelete: "cascade"`), which is fine — but a rate referenced by an in-flight checkout/historical order snapshot should be handled like methods (feature README risk); prefer deactivation if that's a concern.
- Keep price in cents (integer) consistent with the rest of the system (`priceInCents` everywhere).

## Acceptance criteria
- [ ] Rate CRUD routes exist and are admin-gated, following the chosen (nested or flat) structure consistently.
- [ ] Create/update validate weight bands (`min<=max`, non-negative), price, delivery time, and parent method existence.
- [ ] Overlapping bands within a method are rejected (at least exact overlaps); gap behavior documented.
- [ ] Lists use the envelope; detail returns the full rate.
- [ ] Swagger + tests in [step-04](./step-04-shipping-swagger-and-tests.md).

## References
- `libs/db/shipping/rate/actions/*` — DB actions to wrap.
- `db/schema.ts` — `shippingRatesTable` fields + cascade to `shippingRatesToCountriesTable`.
- `libs/modules/order/use-cases/checkout/index.ts` — `getSelectedShippingMethod` (how bands are consumed at checkout).
- `libs/entities/shipping/**` — add rate insert/update schemas.
- [step-01](./step-01-shipping-method-admin.md) — method routes/pattern.
