import { popExpiredCheckoutSessions } from "@checkout-session-db";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { stringifyObject } from "@string-utils";
import { CheckoutSession } from "@checkout-session-entity";
import { getProductsFromString } from "../utils/get-products-from-string";
import { increaseProductsStock } from "@product-db";
import { stockClient } from "@r2-adapter";

export const checkExpiredCheckoutSessions = async (): Promise<string> => {
  const expiredSessions = await popExpiredCheckoutSessions();
  if (!expiredSessions.length) {
    return "No sessions were expired";
  }

  logger().info(
    "Existing expired sessions",
    LoggerUseCaseEnum.CHECK_EXPIRED_SESSIONS,
    {
      sessions: stringifyObject(expiredSessions),
    },
  );

  for (const session of expiredSessions) {
    await retrieveProductsStockFromSession(session);
  }

  return "retrieved product stocks from expired session";
};

const retrieveProductsStockFromSession = async (
  session: CheckoutSession,
): Promise<void> => {
  const products = getProductsFromString(session.products);
  const updatedProducts = await increaseProductsStock(products);
  for (const product of updatedProducts) {
    await stockClient.update(product);
  }

  logger().info(
    "Success retrieving products Stock",
    LoggerUseCaseEnum.RELEASE_PRODUCTS,
    {
      releasedProducts: products,
    },
  );
};
