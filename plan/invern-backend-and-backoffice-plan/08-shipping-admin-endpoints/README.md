# 08 — Shipping Admin Endpoints

**Status:** Not Started · **Priority:** P0 · **Track:** Backend API Completion

## Summary
Shipping methods, rates, and rate-to-country assignments have a **complete data-access layer** (`libs/db/shipping/**` — insert/update/delete/select for methods and rates, plus a rate-to-countries operation) but **no admin HTTP surface at all**: there is no `functions/private/shipping/` folder, and the only shipping use-cases that exist are storefront/checkout-facing (list methods for a cart, select a method). This feature builds the missing admin use-case layer over the existing DB actions and exposes it as `/private/shipping/*` routes so the backoffice can manage shipping end-to-end.

## Why this matters
Shipping configuration (which methods exist, their rates by weight band and delivery time, which countries each rate applies to) is core commerce config that currently can only be set via `insert-test-data` seeding or direct DB edits. A store cannot launch or operate without staff being able to define and adjust shipping. Because the DB and (partial) logic already exist, this is primarily a **wiring** gap — high value, contained risk.

## Goals — what "done" looks like
- `/private/shipping/methods` (+ `/{id}`) and `/private/shipping/rates` (+ `/{id}`) expose full CRUD, admin-gated.
- Rate-to-country assignment is manageable (assign/unassign countries to a rate).
- Admin use-cases exist in `libs/modules/shipping/**` over the existing DB actions, mirroring the layering used by other domains.
- List endpoints use the pagination envelope ([07](../07-pagination-filtering-envelope/README.md)).
- `swagger.yaml` documents the new surface; tests cover the CRUD + assignment paths.

## User / business impact
Admin staff: can create/edit/delete shipping methods and rates and control country coverage from the backoffice ([20](../20-backoffice-commerce-config/README.md)). Shoppers: correct shipping options at checkout (the storefront already reads this data; now it can be maintained properly). Engineers: no more DB-poking to change shipping.

## In scope / Out of scope
**In scope:** admin use-cases + `/private/shipping/*` routes for methods, rates, rate-to-country assignment; pagination on lists; swagger; tests.
**Out of scope:** the checkout-side shipping selection logic (already exists, unchanged); shipping-**transaction** status/tracking updates (that's fulfillment — [11](../11-order-fulfillment-endpoints/README.md)); the backoffice shipping UI ([20](../20-backoffice-commerce-config/README.md)).

## Dependencies
**Depends on:** [01](../01-admin-auth-rbac-cors/README.md) (routes must be admin-gated — the `/private` middleware covers them automatically once it exists), [07](../07-pagination-filtering-envelope/README.md) (list envelope). Tests per [04](../04-testing-quality-gates/README.md).
**Blocks:** [20 — Commerce Configuration UI](../20-backoffice-commerce-config/README.md) (shipping screens); reflected in [14](../14-api-contract-typed-client/README.md).

## Steps
| # | Step | Priority | Status | Depends on |
|---|---|---|---|---|
| 01 | [Shipping method admin use-cases & routes](./step-01-shipping-method-admin.md) | P0 | Not Started | 01-admin-auth-rbac-cors/step-02 |
| 02 | [Shipping rate admin use-cases & routes](./step-02-shipping-rate-admin.md) | P0 | Not Started | step-01 |
| 03 | [Rate-to-country assignment endpoints](./step-03-rate-country-assignment.md) | P0 | Not Started | step-02 |
| 04 | [Shipping admin swagger + tests](./step-04-shipping-swagger-and-tests.md) | P0 | Not Started | step-03 |

## Key risks
- **Deleting shipping data with live references.** A shipping method/rate referenced by historical orders or in-flight checkouts can't just vanish. `shippingMethods`/`shippingRates` cascade to `shippingRatesToCountries` but orders store a serialized `shippingMethod` snapshot — verify deletion semantics and prefer soft-delete/deactivation if live references exist.
- **Weight-band overlaps/gaps.** Rates are `[minWeight, maxWeight]` bands per method; overlapping or gapped bands cause the checkout rate-selection (`getSelectShippingMethodAction`) to pick wrong/none. Admin create/update should validate bands.

## Relevant existing code
- `libs/db/shipping/method/actions/{insert,update,delete,select}.ts` — method CRUD actions (exist, unused for admin).
- `libs/db/shipping/rate/actions/{insert,update,delete,select}.ts` — rate CRUD actions (exist, unused for admin).
- `libs/db/shipping/rate/operations/insert-shipping-rate-in-countries.ts` — the rate-to-countries operation (exists, unused).
- `libs/modules/shipping/use-cases/method/{get-shipping-methods,handle-shipping-method-post}.ts` — **checkout-facing only**; no admin CRUD use-cases.
- `libs/entities/shipping/**`, `libs/entities/shipping-transaction/**` — shipping schemas/types.
- `db/schema.ts` — `shippingMethodsTable`, `shippingRatesTable`, `shippingRatesToCountriesTable`.
- `functions/private/**` — note there is **no** `shipping/` folder here today.
- Any other domain's `functions/private/<entity>/index.ts` + `[id]/index.ts` — the route pattern to mirror (e.g. `currencies`).
