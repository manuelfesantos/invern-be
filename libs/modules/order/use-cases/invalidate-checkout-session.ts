import { expireCheckoutSession } from "@stripe-adapter";
import { getCookieHeader } from "@http-utils";
import { selectCheckoutSessionById } from "@checkout-session-db";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { errors } from "@error-handling-utils";
import { getCurrentTime } from "@timer-utils";

const NO_MAX_AGE = 0;

export const invalidateCheckoutSession = async (
  checkoutSessionId: string,
): Promise<string> => {
  const checkoutSession = await selectCheckoutSessionById(checkoutSessionId);

  if (!checkoutSession) {
    logger().info(
      `checkout session with id ${checkoutSessionId} not found`,
      LoggerUseCaseEnum.INVALIDATE_CHECKOUT_SESSION,
    );
    return getCookieHeader("c_s", "", NO_MAX_AGE);
  }
  if (checkoutSession.expiresAt < getCurrentTime()) {
    logger().info(
      `checkout session with id ${checkoutSessionId} already expired`,
      LoggerUseCaseEnum.INVALIDATE_CHECKOUT_SESSION,
    );
    return getCookieHeader("c_s", "", NO_MAX_AGE);
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

  return getCookieHeader("c_s", "", NO_MAX_AGE);
};
