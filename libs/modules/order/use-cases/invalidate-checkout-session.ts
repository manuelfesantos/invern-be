import { expireCheckoutSession } from "@stripe-adapter";
import { selectCheckoutSessionById } from "@checkout-session-db";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { errors } from "@error-handling-utils";
import { getCurrentTime } from "@timer-utils";

export const invalidateCheckoutSession = async (
  checkoutSessionId: string,
): Promise<void> => {
  const checkoutSession = await selectCheckoutSessionById(checkoutSessionId);

  if (!checkoutSession) {
    logger().info(
      `checkout session with id ${checkoutSessionId} not found`,
      LoggerUseCaseEnum.INVALIDATE_CHECKOUT_SESSION,
    );
    return;
  }
  if (checkoutSession.expiresAt < getCurrentTime()) {
    logger().info(
      `checkout session with id ${checkoutSessionId} already expired`,
      LoggerUseCaseEnum.INVALIDATE_CHECKOUT_SESSION,
    );
    return;
  }

  const productsString = checkoutSession.products;

  if (!productsString) {
    throw errors.PRODUCTS_ARE_REQUIRED();
  }

  await expireCheckoutSession(checkoutSessionId);

  logger().info(
    "successfully expired checkout session",
    LoggerUseCaseEnum.INVALIDATE_CHECKOUT_SESSION,
    { checkoutSessionId },
  );
};
