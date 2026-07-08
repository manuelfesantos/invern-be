---
status: Not Started
priority: P1
feature: 18-backoffice-catalog
track: backoffice-app
depends_on: ["18-backoffice-catalog/step-01", "17-backoffice-design-system/step-03", "03-payment-stock-integrity/step-02"]
blocks: ["18-backoffice-catalog/step-04"]
---
# Step 02: Product create/edit form

**Status:** Not Started · **Priority:** P1 · **Feature:** [Catalog Management](./README.md)

## Technical goal
Build the product create/edit form on the shared forms layer, mirroring `insertProductSchema`, covering name, description, price, weight, and collection — but **excluding stock** (edited via the stock screen), with images managed via the upload UI ([step-04](./step-04-image-upload-ui.md)).

## User impact
Admin staff can create new products and edit existing ones with validated inputs and clear errors.

## Current state
- `POST /private/products` (create) and `PUT /private/products/{id}` (update) exist; after [03 step-02](../03-payment-stock-integrity/step-02-tri-store-stock-consistency.md), the update **excludes stock** from its payload (stock goes through the dedicated path).
- `insertProductSchema` (`libs/entities/product/product-entity.ts`): name, description, priceInCents, collectionId, stock, weight. Product detail includes images.
- The forms layer + money/units helpers exist ([17 step-03](../17-backoffice-design-system/step-03-forms-layer.md)).

## Technical steps
1. Build the form (RHF + Zod mirroring `insertProductSchema` minus `stock` for update): name, description (textarea), price (currency input → cents), weight (grams → base unit), collection (select from collections).
2. For **create**: decide initial stock handling — since stock is managed separately, either allow an initial stock on create (the create payload still includes stock) or default to 0 and require setting it via the stock screen. Recommend allowing initial stock on create only (a new product's starting inventory), and document that subsequent changes go through [22](../22-backoffice-stock/README.md). Coordinate with [03 step-02](../03-payment-stock-integrity/step-02-tri-store-stock-consistency.md)'s decision on where create-time stock is written (it must still write through the tri-store path).
3. For **edit**: show stock read-only with a link to the stock screen; never submit stock in the update payload.
4. Collection select: load collections (from [step-03](./step-03-collections-management.md)'s data) — a product requires a `collectionId` (schema: not null).
5. Submit → create/update mutation → success toast → navigate to the product (or list); map validation errors to fields.
6. Integrate the image section ([step-04](./step-04-image-upload-ui.md)) into the edit view (images attach to an existing product id).

## Dependencies
**Depends on:** [step-01](./step-01-products-list-screen.md), [17 step-03](../17-backoffice-design-system/step-03-forms-layer.md), [03 step-02](../03-payment-stock-integrity/step-02-tri-store-stock-consistency.md).
**Blocks:** [step-04](./step-04-image-upload-ui.md).

## Implementation notes
- **Stock is the trap.** The whole reason [03](../03-payment-stock-integrity/README.md) restructured stock writes is so the product form can't desync the three stores. Editing must not submit stock; create-time initial stock (if allowed) must go through the safe path. Make this explicit in the form and the mutation.
- Price/weight use the integer-cents/base-unit convention — reuse the shared helper so a €12.50 product stores `1250`.
- A product needs a collection; if none exist yet, guide the user to create a collection first (the collection select shouldn't be empty-and-unsubmittable with no explanation).
- Images require an existing product id (association), so the image UI appears in edit mode (or after initial create) — sequence the UX accordingly.

## Acceptance criteria
- [ ] Create and edit forms mirror `insertProductSchema` (minus stock on edit) with inline validation.
- [ ] Editing never submits stock; stock is shown read-only with a link to the stock screen.
- [ ] Create-time initial stock (if allowed) writes through the safe tri-store path.
- [ ] Price/weight use the integer-cents/base-unit conversion.
- [ ] Submit maps validation errors to fields and confirms success; the image section is available in edit.

## References
- `libs/entities/product/product-entity.ts` — `insertProductSchema`.
- `apps/backend/src/routes/private/products.ts` — update endpoint (stock-excluded post-[03](../03-payment-stock-integrity/README.md)).
- [03 step-02](../03-payment-stock-integrity/step-02-tri-store-stock-consistency.md) — the stock-write restructuring this depends on.
- [17 step-03](../17-backoffice-design-system/step-03-forms-layer.md) — forms layer + money helpers.
- [22](../22-backoffice-stock/README.md) — the stock-editing screen linked from here.
