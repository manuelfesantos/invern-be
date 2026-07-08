---
status: Not Started
priority: P1
feature: 10-taxes-admin-surface
track: backend-api-completion
depends_on: []
blocks: ["10-taxes-admin-surface/step-02"]
---
# Step 01: Tax module, rate-storage fix & Stripe-mirroring decision

**Status:** Not Started · **Priority:** P1 · **Feature:** [Taxes Admin Surface](./README.md)

## Technical goal
Create a tax business-logic module over the existing tax DB actions, diagnose and fix the rate-storage representation, and decide whether tax writes mirror to Stripe Tax or treat D1 as the source of truth.

## User impact
None directly (module + data-model work); unblocks the tax admin routes staff will use.

## Current state
- No tax module exists (`find libs/modules -ipath "*tax*"` → nothing). Tax DB actions exist but are unused outside seeding.
- **Rate-storage bug (needs confirmation + fix):** `taxesTable.rate` is `int("rate")` and nullable (`db/schema.ts`). The seed inserts `rate: percentageToRate(percentage)` where `percentageToRate = percentage / 100` (`libs/utils/number/index.ts`) — e.g. a 23% rate becomes `0.23`, a **fraction stored into an INTEGER column**. In SQLite's flexible typing this may round to `0` or store the real via type affinity — **verify the actual stored/returned value** during implementation before deciding the fix. Whatever the truth, an integer column holding a fractional rate is wrong or fragile.
- The extender consumes rates (`calculate-tax-amount.ts`, `extend-taxes.ts`, `get-taxed-price.ts`) — the fix must match what that math expects (a fraction like `0.23`, or basis points, or a percent). Determine the expected unit from the extender code, not assumption.
- `getStripeTaxes()` maps Stripe `percentage` + `country` into the tax rows during seeding; `createStripeTax`/`updateStripeTax` exist but are unused.

## Technical steps
1. Determine the intended rate unit by reading the extender math (`calculate-tax-amount.ts` etc.) and the client tax schema (`extendedClientTaxSchema`). Document what the consumers expect (fraction vs percent vs basis points).
2. Decide the storage representation to match: either change `rate` to `real` (store the fraction `0.23`) via a schema migration, or store an integer in a well-defined unit (e.g. basis points: 2300) and convert at the edges. Prefer whichever the extender already assumes to minimize consumer changes; a `real` column holding the fraction is the least-surprising given `percentageToRate` produces a fraction.
3. If a schema migration is needed, generate it with `drizzle-kit generate` and include a data-migration for existing rows (convert whatever is currently stored to the correct representation). Test the pricing math before/after to prove no price changes unintentionally.
4. Build the tax module (`libs/modules/tax/**`): `addTax(body)`, `updateTax(id, body)`, `deleteTax(id)`, `getTaxById(id)`, `getTaxesPage(pagination, filter)` (filter by `countryCode`) — thin wrappers over the DB actions with Zod validation (rate range 0–1 if fraction; non-negative; valid `countryCode` referencing an existing country).
5. Decide Stripe mirroring (document the choice):
   - **(a) D1 is the source of truth**, Stripe Tax not written from the backoffice (simplest; the seed's Stripe pull becomes a one-time/bootstrap concern). Risk: D1 and Stripe Tax diverge if Stripe Tax is used at checkout — verify whether checkout uses Stripe Tax rates or the D1 taxes (the extender uses D1 taxes for display; confirm the Stripe checkout session's tax behavior).
   - **(b) Mirror writes to Stripe** using `createStripeTax`/`updateStripeTax` so the two stay aligned.
   - Recommended: confirm what checkout actually uses first; if checkout relies on the D1 `taxes` table (likely, given the extender), choose **(a)** and note Stripe Tax as bootstrap-only. If Stripe Tax rates are authoritative at payment time, choose **(b)**.
6. Validate country linkage: a tax's `countryCode` must reference an existing country; a country may have multiple taxes (schema is `many`) — decide if that's intended or if it should be one-per-country and enforce accordingly.

## Dependencies
**Depends on:** None (but coordinate schema migration with [05 step-05](../05-configuration-data-hygiene/step-05-wrangler-config-and-readme.md)'s documented migration workflow).
**Blocks:** [step-02](./step-02-taxes-routes.md).

## Implementation notes
- **Confirm the bug before fixing it.** SQLite type affinity may mean the fractional value is actually preserved as a real despite the `int` declaration — read a seeded row (`wrangler d1 execute ... "SELECT rate FROM taxes"`) to see ground truth, then fix the *declaration* to match reality and the consumers. Don't "fix" a value that's actually fine and break the math.
- The pricing math is money-critical: pin it with tests (from [04](../04-testing-quality-gates/README.md)) **before** touching rate storage, so any change is provably price-neutral.
- Multiple taxes per country: the schema allows it and the product pricing sums a `taxes[]` array (`priceDetailsSchema.taxes` is an array). So per-country-multiple may be intentional (e.g. compound taxes). Verify before constraining to one-per-country.

## Acceptance criteria
- [ ] The intended rate unit is documented from the extender code; storage representation matches it.
- [ ] Any schema/data migration is generated, includes existing-row conversion, and is proven price-neutral by tests.
- [ ] A tax module exists with validated CRUD use-cases over the DB actions.
- [ ] The Stripe-mirroring decision is made and documented, grounded in what checkout actually uses.
- [ ] Country linkage is validated; multi-tax-per-country behavior is decided and enforced.

## References
- `db/schema.ts` — `taxesTable` (`rate: int`, `countryCode` FK).
- `libs/utils/number/index.ts` — `percentageToRate`.
- `functions/private/insert-test-data/_test-data/taxes.ts` — current seeding + rate storage.
- `libs/utils/extender/utils/{calculate-tax-amount,extend-taxes,get-taxed-price}.ts` — rate consumers.
- `libs/entities/tax/tax-entity.ts` — tax schemas (`extendedClientTaxSchema`).
- `libs/db/tax/actions/*`, `libs/adapters/stripe/tax/*` — DB actions + Stripe adapter.
