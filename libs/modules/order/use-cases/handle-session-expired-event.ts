import { StripeSessionResult } from "@stripe-entity";
import { increaseProductsStock } from "@product-db";
import { successResponse } from "@response-entity";
import { stockClient } from "@r2-adapter";
import { popCheckoutSessionById } from "@checkout-session-db";
import { getProductsFromString } from "../utils/get-products-from-string";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";

export const handleSessionExpiredEvent = async (
  event: StripeSessionResult,
): Promise<Response> => {
  const { id: checkoutSessionId } = event;
  const [checkoutSession] = await popCheckoutSessionById(checkoutSessionId);

  if (!checkoutSession) {
    logger().info(
      "checkout session already expired",
      LoggerUseCaseEnum.HANDLE_CHECKOUT_SESSION,
      { checkoutSessionId },
    );
    return successResponse.OK("session expiry already handled");
  }

  const { products: productsString } = checkoutSession;

  if (!productsString) {
    throw new Error("No products found in checkout session");
  }

  const products = getProductsFromString(productsString);

  const updatedProducts = await increaseProductsStock(products);
  for (const product of updatedProducts) {
    await stockClient.update(product);
  }
  return successResponse.OK(
    "success getting checkout-session expired. ",
    products,
  );
};
