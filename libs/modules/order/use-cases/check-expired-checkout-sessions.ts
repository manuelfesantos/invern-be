import { popExpiredCheckoutSessions } from "@checkout-session-db";
import { successResponse } from "@response-entity";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { stringifyObject } from "@string-utils";
import { CheckoutSession } from "@checkout-session-entity";
import { getProductsFromString } from "../utils/get-products-from-string";
import { increaseProductsStock } from "@product-db";
import { stockClient } from "@r2-adapter";

export const checkExpiredCheckoutSessions = async (): Promise<Response> => {
  const expiredSessions = await popExpiredCheckoutSessions();
  if (!expiredSessions.length) {
    return successResponse.OK("No sessions were expired");
  }

  logger().info(
    "Exiting expired sessions",
    LoggerUseCaseEnum.CHECK_EXPIRED_SESSIONS,
    {
      sessions: stringifyObject(expiredSessions),
    },
  );

  for (const session of expiredSessions) {
    await retrieveProductsStockFromSession(session);
  }

  return successResponse.OK("retrieved product stocks from expired session");
};

const retrieveProductsStockFromSession = async (
  session: CheckoutSession,
): Promise<void> => {
  const products = getProductsFromString(session.products);
  const updatedProducts = await increaseProductsStock(products);
  for (const product of updatedProducts) {
    await stockClient.update(product);
  }
};
