import { StripeSessionResult } from "@stripe-entity";
import { increaseProductsStock } from "@product-db";
import { stockClient } from "@r2-adapter";
import { popCheckoutSessionById } from "@checkout-session-db";
import { logger, logCredentials } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { withTransaction } from "@db";

export const handleSessionExpiredEvent = withTransaction(
  async (event: StripeSessionResult): Promise<string> => {
    const { id: checkoutSessionId } = event;
    const [checkoutSession] = await popCheckoutSessionById(checkoutSessionId);

    if (!checkoutSession) {
      logger().info("checkout session already expired", {
        useCase: LoggerUseCaseEnum.HANDLE_CHECKOUT_SESSION,
        data: {
          checkoutSessionId,
        },
      });
      return "checkout session already expired";
    }

    const { products, userId, cartId } = checkoutSession;

    logCredentials(cartId, userId);

    const updatedProducts = await increaseProductsStock(products);
    await stockClient.updateMany(updatedProducts);

    return "checkout session successfully expired";
  },
);
