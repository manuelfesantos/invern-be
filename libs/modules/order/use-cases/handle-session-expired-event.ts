import { StripeSessionResult } from "@stripe-entity";
import { getProductsFromMetadata } from "../utils/get-products-from-metadata";
import { increaseProductsStock } from "@product-db";
import { successResponse } from "@response-entity";
import { stockClient } from "@r2-adapter";

export const handleSessionExpiredEvent = async (
  event: StripeSessionResult,
): Promise<Response> => {
  const { products: productsString } = event.metadata || {};
  const products = getProductsFromMetadata(productsString);
  const updatedProducts = await increaseProductsStock(products);
  for (const product of updatedProducts) {
    await stockClient.update(product);
  }
  return successResponse.OK(
    "success getting checkout-session expired. ",
    products,
  );
};
