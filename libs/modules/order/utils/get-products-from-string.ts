import type {
  ProductIdAndQuantity} from "@product-entity";
import {
  productIdAndQuantityArraySchema,
} from "@product-entity";

export const getProductsFromString = (
  productsString: string,
): ProductIdAndQuantity[] =>
  productIdAndQuantityArraySchema.parse(JSON.parse(productsString));
