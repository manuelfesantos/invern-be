import {
  ProductIdAndQuantity,
  productIdAndQuantityArraySchema,
} from "@product-entity";

export const getProductsFromString = (
  productsString: string,
): ProductIdAndQuantity[] =>
  productIdAndQuantityArraySchema.parse(JSON.parse(productsString));
