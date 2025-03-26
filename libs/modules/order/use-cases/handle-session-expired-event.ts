import { StripeSessionResult } from "@stripe-entity";
import { increaseProductsStock } from "@product-db";
import { successResponse } from "@response-entity";
import { stockClient } from "@r2-adapter";
import { popCheckoutSessionById } from "@checkout-session-db";
import { logger, logCredentials } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { withTransaction } from "@db";

export const handleSessionExpiredEvent = withTransaction(
  async (event: StripeSessionResult): Promise<Response> => {
    const { id: checkoutSessionId } = event;
    const [checkoutSession] = await popCheckoutSessionById(checkoutSessionId);

    if (!checkoutSession) {
      logger().info("checkout session already expired", {
        useCase: LoggerUseCaseEnum.HANDLE_CHECKOUT_SESSION,
        data: {
          checkoutSessionId,
        },
      });
      return successResponse.OK("session expiry already handled");
    }

    const { products, userId, cartId } = checkoutSession;

    logCredentials(cartId, userId);

    const updatedProducts = await increaseProductsStock(products);
    await stockClient.updateMany(updatedProducts);

    return successResponse.OK(
      "success getting checkout-session expired. ",
      products,
    );
  },
);
