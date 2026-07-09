import { getPopExpiredCheckoutSessionsAction } from "@checkout-session-db";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import type { CheckoutSession } from "@checkout-session-entity";
import { releaseProductsStock } from "@stock-module";

export const deleteExpiredCheckoutSessions = async (): Promise<string> => {
  const expiredSessions = await getPopExpiredCheckoutSessionsAction().run();
  if (!expiredSessions.length) {
    return "No sessions were expired";
  }

  logger().info("Existing expired sessions", {
    useCase: LoggerUseCaseEnum.CHECK_EXPIRED_SESSIONS,
    data: {
      count: expiredSessions.length,
    },
  });

  for (const session of expiredSessions) {
    await retrieveProductsStockFromSession(session);
  }

  return "retrieved product stocks from expired session";
};

const retrieveProductsStockFromSession = async (
  session: CheckoutSession,
): Promise<void> => {
  await releaseProductsStock(session.products);

  logger().info("Success retrieving products Stock", {
    useCase: LoggerUseCaseEnum.RELEASE_PRODUCTS,
    data: {
      releasedProducts: session.products,
    },
  });
};
