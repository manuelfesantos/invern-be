import {
  ExtendedLineItem,
  extendedLineItemSchema,
  LineItem,
} from "@product-entity";
import { Country } from "@country-entity";
import { getTaxedPrice } from "./get-taxed-price";
import { extendTaxes } from "./extend-taxes";

export const extendLineItem = (
  lineItem: LineItem,
  country: Country,
): ExtendedLineItem => {
  const extendedTaxes = extendTaxes(lineItem.priceInCents, country.taxes);

  const taxedPrice = getTaxedPrice(extendedTaxes);

  return extendedLineItemSchema.parse({
    ...lineItem,
    netPrice: lineItem.priceInCents,
    grossPrice: lineItem.priceInCents + taxedPrice,
    taxes: extendedTaxes,
  });
};
