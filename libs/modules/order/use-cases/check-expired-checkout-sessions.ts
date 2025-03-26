import { popExpiredCheckoutSessions } from "@checkout-session-db";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { stringifyObject } from "@string-utils";
import { CheckoutSession } from "@checkout-session-entity";
import { increaseProductsStock } from "@product-db";
import { stockClient } from "@r2-adapter";
import { withTransaction } from "@db";

export const checkExpiredCheckoutSessions = withTransaction(
  async (): Promise<string> => {
    const expiredSessions = await popExpiredCheckoutSessions();
    if (!expiredSessions.length) {
      return "No sessions were expired";
    }

    logger().info("Existing expired sessions", {
      useCase: LoggerUseCaseEnum.CHECK_EXPIRED_SESSIONS,
      data: {
        sessions: stringifyObject(expiredSessions),
      },
    });

    for (const session of expiredSessions) {
      await retrieveProductsStockFromSession(session);
    }

    return "retrieved product stocks from expired session";
  },
);

const retrieveProductsStockFromSession = async (
  session: CheckoutSession,
): Promise<void> => {
  const updatedProducts = await increaseProductsStock(session.products);
  await stockClient.updateMany(updatedProducts);

  logger().info("Success retrieving products Stock", {
    useCase: LoggerUseCaseEnum.RELEASE_PRODUCTS,
    data: {
      releasedProducts: session.products,
    },
  });
};
