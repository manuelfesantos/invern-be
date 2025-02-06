import {
  ExtendedProduct,
  extendedProductSchema,
  ExtendedProductWithCollectionDetails,
  extendedProductWithCollectionDetailsSchema,
  Product,
  ProductWithCollectionDetails,
} from "@product-entity";
import { getTaxedPrice } from "./utils/get-taxed-price";
import { extendTaxes } from "./utils/extend-taxes";
import { contextStore } from "@context-utils";

export const extendProduct = (product: Product): ExtendedProduct => {
  const { country } = contextStore.context;
  const extendedTaxes = extendTaxes(product.priceInCents, country.taxes);

  const taxedPrice = getTaxedPrice(extendedTaxes);

  const extendedProduct: ExtendedProduct = {
    ...product,
    netPrice: product.priceInCents,
    grossPrice: product.priceInCents + taxedPrice,
    taxes: extendedTaxes,
  };

  return extendedProductSchema.parse(extendedProduct);
};

export const extendProductDetails = (
  product: ProductWithCollectionDetails,
): ExtendedProductWithCollectionDetails => {
  const { country } = contextStore.context;
  const extendedTaxes = extendTaxes(product.priceInCents, country.taxes);

  const taxedPrice = getTaxedPrice(extendedTaxes);

  const extendedProductDetails: ExtendedProductWithCollectionDetails = {
    ...product,
    netPrice: product.priceInCents,
    grossPrice: product.priceInCents + taxedPrice,
    taxes: extendedTaxes,
  };

  return extendedProductWithCollectionDetailsSchema.parse(
    extendedProductDetails,
  );
};
