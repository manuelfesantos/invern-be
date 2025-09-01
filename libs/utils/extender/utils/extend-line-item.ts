import type {
  ExtendedLineItem,
  LineItem,
  LineItemError} from "@product-entity";
import {
  extendedLineItemSchema,
  LineItemErrorEnum,
} from "@product-entity";
import type { Country } from "@country-entity";
import { getTaxedPrice } from "./get-taxed-price";
import { extendTaxes } from "./extend-taxes";

const NO_STOCK = 0;

export const extendLineItem = (
  lineItem: LineItem,
  country: Country,
): ExtendedLineItem => {
  const issues: LineItemError[] = [];
  const extendedTaxes = extendTaxes(lineItem.priceInCents, country.taxes);

  const taxedPrice = getTaxedPrice(extendedTaxes);

  if (lineItem.quantity > lineItem.stock) {
    issues.push({
      message:
        lineItem.stock > NO_STOCK
          ? `Not enough stock. Current stock: ${lineItem.stock}`
          : "Product is out of stock",
      type: LineItemErrorEnum.NOT_ENOUGH_STOCK,
    });
  }

  const extendedLineItem: ExtendedLineItem = {
    ...lineItem,
    netPrice: lineItem.priceInCents,
    grossPrice: lineItem.priceInCents + taxedPrice,
    taxes: extendedTaxes,
    ...(issues.length && { issues }),
  };

  return extendedLineItemSchema.parse(extendedLineItem);
};
