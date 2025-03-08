import {
  ExtendedLineItem,
  extendedLineItemSchema,
  LineItem,
  LineItemError,
  LineItemErrorEnum,
} from "@product-entity";
import { Country } from "@country-entity";
import { getTaxedPrice } from "./get-taxed-price";
import { extendTaxes } from "./extend-taxes";

const NO_STOCK = 0;

export const extendLineItem = (
  lineItem: LineItem,
  country: Country,
): ExtendedLineItem => {
  const errors: LineItemError[] = [];
  const extendedTaxes = extendTaxes(lineItem.priceInCents, country.taxes);

  const taxedPrice = getTaxedPrice(extendedTaxes);

  if (lineItem.quantity > lineItem.stock) {
    errors.push({
      message:
        lineItem.stock > NO_STOCK
          ? `There is not enough stock for this product. Current stock: ${lineItem.stock}`
          : "Product is out of stock",
      type: LineItemErrorEnum.NOT_ENOUGH_STOCK,
    });
  }

  const extendedLineItem: ExtendedLineItem = {
    ...lineItem,
    netPrice: lineItem.priceInCents,
    grossPrice: lineItem.priceInCents + taxedPrice,
    taxes: extendedTaxes,
    ...(errors.length && { errors }),
  };

  return extendedLineItemSchema.parse(extendedLineItem);
};
