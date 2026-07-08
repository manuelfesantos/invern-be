# 20 — Commerce Configuration UI

**Status:** Not Started · **Priority:** P1 · **Track:** Backoffice App

## Summary
The backoffice screens for commerce configuration: countries, currencies, taxes, and shipping methods/rates (with country coverage). These are the settings that drive pricing, tax, and delivery options across the store. Built on the shared table/forms/design system against the currency/country endpoints (existing, now paginated) and the new taxes ([10](../10-taxes-admin-surface/README.md)) and shipping ([08](../08-shipping-admin-endpoints/README.md)) admin APIs.

## Why this matters
Commerce config is the operational control panel: which countries you sell to, in what currencies, at what tax rates, with what shipping options and prices. Today most of it can only be changed by seeding or direct DB edits (shipping and taxes have no admin API at all until Track B). Staff need to manage it safely from the UI.

## Goals — what "done" looks like
- Countries and currencies management screens (list + create/edit/delete).
- Taxes management (per the [10](../10-taxes-admin-surface/README.md) decision — standalone surface, possibly presented near countries).
- Shipping methods + rates management, including assigning countries to rates ([08](../08-shipping-admin-endpoints/README.md)).
- Interdependencies handled (a country references a currency; a tax references a country; a rate references a method + countries) with sensible UX and guardrails.
- Consistent states and destructive-action confirmation (deletes here can cascade widely).

## User / business impact
Admin staff: control the store's commercial configuration from the UI. Shoppers: correct prices, taxes, and shipping options.

## In scope / Out of scope
**In scope:** countries, currencies, taxes, shipping methods/rates + country assignment screens.
**Out of scope:** live FX integration (§4 — `rateToEuro` stays manual); the backend config APIs ([08](../08-shipping-admin-endpoints/README.md)/[10](../10-taxes-admin-surface/README.md)); stock ([22](../22-backoffice-stock/README.md)).

## Dependencies
**Depends on:** [16](../16-backoffice-auth-shell/README.md), [17](../17-backoffice-design-system/README.md), [07](../07-pagination-filtering-envelope/README.md), [08](../08-shipping-admin-endpoints/README.md) (shipping API), [10](../10-taxes-admin-surface/README.md) (taxes API). Countries/currencies APIs already exist.
**Blocks:** None.

## Steps
| # | Step | Priority | Status | Depends on |
|---|---|---|---|---|
| 01 | [Countries & currencies screens](./step-01-countries-currencies-screens.md) | P1 | Not Started | 16-backoffice-auth-shell/step-03, 17-backoffice-design-system/step-02, 17-backoffice-design-system/step-03 |
| 02 | [Taxes screens](./step-02-taxes-screens.md) | P1 | Not Started | step-01, 10-taxes-admin-surface/step-02 |
| 03 | [Shipping methods & rates screens](./step-03-shipping-screens.md) | P1 | Not Started | step-01, 08-shipping-admin-endpoints/step-03 |

## Key risks
- **Cascading deletes.** Deleting a currency/country cascades widely (countries → taxes/shipping-rate-to-country; currency → countries). The UI must warn with real consequences, not a generic "are you sure."
- **Interdependency ordering.** You can't create a country without a currency, or a tax/shipping-rate-country without the country. The UX must guide creation order.

## Relevant existing code / references
- `apps/backend/src/routes/private/currencies.ts`, `countries.ts` — existing CRUD (paginated after [07](../07-pagination-filtering-envelope/README.md)).
- `libs/entities/currency/**`, `country/**`, `tax/**`, `shipping/**` — schemas the forms mirror.
- [08](../08-shipping-admin-endpoints/README.md) — shipping admin API; [10](../10-taxes-admin-surface/README.md) — taxes admin API.
- `db/schema.ts` — the cascade relationships to warn about.
