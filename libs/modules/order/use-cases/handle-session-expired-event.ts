import { StripeSessionResult } from "@stripe-entity";
import { getIncreaseProductsStockAction } from "@product-db";
import { stockClient } from "@r2-adapter";
import { getPopCheckoutSessionByIdAction } from "@checkout-session-db";
import { logger, logCredentials } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";

export const handleSessionExpiredEvent = async (
  event: StripeSessionResult,
): Promise<string> => {
  const { id: checkoutSessionId } = event;
  const [checkoutSession] =
    await getPopCheckoutSessionByIdAction(checkoutSessionId).run();

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

  const updatedProducts = await getIncreaseProductsStockAction(products).run();

  await stockClient.updateMany(updatedProducts);

  return "checkout session successfully expired";
};
