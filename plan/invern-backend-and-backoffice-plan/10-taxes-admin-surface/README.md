# 10 — Taxes Admin Surface

**Status:** Done · **Priority:** P1 · **Track:** Backend API Completion

## Summary
Taxes are effectively **unmanageable** today. Contrary to the task brief's §6 ("tax creation/update is bundled into the currency admin flow"), the currency module touches no tax or Stripe code at all (verified: `grep -rni "tax\|stripe" libs/modules/currency/` is empty). Taxes are seeded **once** via `/private/insert-test-data` (which pulls Stripe tax rates and inserts them into `taxesTable`), and the tax DB actions (`libs/db/tax/**`) plus the Stripe tax adapter (`libs/adapters/stripe/tax/**`) are otherwise unused. There is no tax module and no `/private/taxes` route. This feature gives taxes a first-class admin surface so staff can manage the per-country tax rates that pricing depends on — and fixes a latent rate-storage bug found during the audit.

## Why this matters
Tax rates drive every displayed and charged price (the extender computes taxed prices per country). If a rate is wrong or a country is missing a tax, customers are mischarged — a legal/financial problem, not a cosmetic one. Right now the only way to change a tax is to re-run seed data or edit the DB directly. Staff need to view and correct tax rates per country from the backoffice.

## Design decision (open question 3 in the root README)
The brief frames this as "standalone `/private/taxes` vs nested under currencies." Since the "nested under currencies" model **does not exist in code**, this plan builds a **standalone `/private/taxes`** surface (taxes belong to countries in the schema — `taxes.countryCode` → `countries.code` — not to currencies). The backoffice may still *present* taxes within the country/commerce-config screen ([20](../20-backoffice-commerce-config/README.md)); that's a UI choice layered over a clean standalone API. Confirm with the user before building.

## Goals — what "done" looks like
- `/private/taxes` (+ `/{id}`) exposes CRUD for tax rates, admin-gated, over the existing tax DB actions via a new tax module.
- The relationship to countries is explicit (a tax belongs to a country; list/filter by country).
- The rate-storage bug (fraction into an int column) is diagnosed and fixed with a clear, tested representation.
- The relationship to Stripe Tax is decided: whether the backend mirrors changes to Stripe (as the seed does on read) or treats the D1 tax table as the source of truth.
- Swagger + tests.

## User / business impact
Admin staff: can view and correct per-country tax rates from the backoffice. Shoppers: correct tax on prices and at checkout. Finance: tax config becomes auditable and changeable without engineering.

## In scope / Out of scope
**In scope:** a tax module + `/private/taxes` CRUD; country relationship; rate-storage fix; Stripe-mirroring decision; swagger; tests.
**Out of scope:** automated tax calculation services (e.g. full Stripe Tax automation) beyond the existing model; VAT/GST compliance reporting; the backoffice tax UI ([20](../20-backoffice-commerce-config/README.md)).

## Dependencies
**Depends on:** [01](../01-admin-auth-rbac-cors/README.md) (admin gate), [07](../07-pagination-filtering-envelope/README.md) (list envelope). Tests per [04](../04-testing-quality-gates/README.md).
**Blocks:** [20 — Commerce Configuration UI](../20-backoffice-commerce-config/README.md) (tax screens); reflected in [14](../14-api-contract-typed-client/README.md).

## Steps
| # | Step | Priority | Status | Depends on |
|---|---|---|---|---|
| 01 | [Tax module, rate-storage fix & Stripe-mirroring decision](./step-01-tax-module-and-rate-fix.md) | P1 | Done | — |
| 02 | [`/private/taxes` CRUD routes](./step-02-taxes-routes.md) | P1 | Done | step-01, 01-admin-auth-rbac-cors/step-02 |
| 03 | [Taxes swagger + tests](./step-03-taxes-swagger-and-tests.md) | P1 | Done | step-02 |

## Key risks
- **Changing rate representation affects live pricing math.** The extender (`libs/utils/extender/utils/calculate-tax-amount.ts` etc.) consumes tax rates; any storage-format change must be matched there and covered by tests, or every price silently shifts.
- **Two sources of truth (D1 vs Stripe Tax).** The seed pulls from Stripe; if the backoffice writes to D1 only, D1 and Stripe diverge. Decide which is authoritative and whether writes propagate.

## Relevant existing code
- `libs/db/tax/actions/{insert,update,delete,select}.ts` — tax DB actions (exist, used only by seeding).
- `libs/adapters/stripe/tax/{create-tax,update-tax,get-taxes}.ts` — Stripe tax adapter (exists; `getStripeTaxes` used by seed; create/update unused).
- `functions/private/insert-test-data/_test-data/taxes.ts` — seeds taxes from `getStripeTaxes()` with `rate: percentageToRate(percentage)`.
- `libs/entities/tax/tax-entity.ts` — tax schema/types (`extendedClientTaxSchema` used in product pricing).
- `libs/utils/extender/utils/{calculate-tax-amount,extend-taxes,get-taxed-price}.ts` — where rates are consumed.
- `db/schema.ts` — `taxesTable` (`rate: int("rate")` nullable, `countryCode` → `countries.code` cascade).
- `libs/utils/number/index.ts` — `percentageToRate` (`percentage / 100`).
- There is **no** `libs/modules/*tax*` (verified).
