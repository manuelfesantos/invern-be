import { StripeSessionResult } from "@stripe-entity";
import { getProductsFromMetadata } from "../utils/get-products-from-metadata";
import { increaseProductsStock } from "@product-db";
import { successResponse } from "@response-entity";
import { stringifyObject } from "@string-utils";

export const handleSessionExpiredEvent = async (
  event: StripeSessionResult,
): Promise<Response> => {
  const { products: productsString } = event.metadata || {};
  const products = getProductsFromMetadata(productsString);
  await increaseProductsStock(products);
  return successResponse.OK(
    "success getting checkout-session expired. ",
    stringifyObject(products),
  );
};
