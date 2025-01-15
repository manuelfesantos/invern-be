import {
  ExtendedProduct,
  extendedProductSchema,
  ExtendedProductWithCollectionDetails,
  extendedProductWithCollectionDetailsSchema,
  Product,
  ProductWithCollectionDetails,
} from "@product-entity";
import { Country } from "@country-entity";
import { getTaxedPrice } from "./utils/get-taxed-price";
import { extendTaxes } from "./utils/extend-taxes";

export const extendProduct = (
  product: Product,
  country: Country,
): ExtendedProduct => {
  const extendedTaxes = extendTaxes(product.priceInCents, country.taxes);

  const taxedPrice = getTaxedPrice(extendedTaxes);

  return extendedProductSchema.parse({
    ...product,
    netPrice: product.priceInCents,
    grossPrice: product.priceInCents + taxedPrice,
    taxes: extendedTaxes,
  });
};

export const extendProductDetails = (
  product: ProductWithCollectionDetails,
  country: Country,
): ExtendedProductWithCollectionDetails => {
  const extendedTaxes = extendTaxes(product.priceInCents, country.taxes);

  const taxedPrice = getTaxedPrice(extendedTaxes);

  return extendedProductWithCollectionDetailsSchema.parse({
    ...product,
    netPrice: product.priceInCents,
    grossPrice: product.priceInCents + taxedPrice,
    taxes: extendedTaxes,
  });
};
