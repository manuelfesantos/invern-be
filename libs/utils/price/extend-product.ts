import {
  ExtendedProduct,
  extendedProductSchema,
  Product,
} from "@product-entity";
import { Country } from "@country-entity";
import { getTaxedPrice } from "./utils/get-taxed-price";
import { extendTaxes } from "./utils/extend-taxes";
import { getFirstCurrencyFromCountry } from "./utils/get-first-currency";

export const extendProduct = (
  product: Product,
  country: Country,
): ExtendedProduct => {
  const extendedTaxes = extendTaxes(product.priceInCents, country.taxes);

  const taxedPrice = getTaxedPrice(extendedTaxes);

  const currency = getFirstCurrencyFromCountry(country);

  return extendedProductSchema.parse({
    ...product,
    netPrice: product.priceInCents,
    grossPrice: product.priceInCents + taxedPrice,
    taxes: extendedTaxes,
    currency,
  });
};
