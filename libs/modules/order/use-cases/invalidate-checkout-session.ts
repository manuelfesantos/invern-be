import { expireCheckoutSession } from "@stripe-adapter";
import {
  deleteCheckoutSessionById,
  selectCheckoutSessionById,
} from "@checkout-session-db";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { errors } from "@error-handling-utils";
import { getCurrentTime } from "@timer-utils";
import { increaseProductsStock } from "@product-db";
import { stockClient } from "@r2-adapter";
import { withTransaction } from "@db";

export const invalidateCheckoutSession = withTransaction(
  async (checkoutSessionId: string): Promise<boolean> => {
    const checkoutSession = await selectCheckoutSessionById(checkoutSessionId);

    if (!checkoutSession) {
      logger().info(`checkout session with id ${checkoutSessionId} not found`, {
        useCase: LoggerUseCaseEnum.INVALIDATE_CHECKOUT_SESSION,
      });
      return false;
    }
    if (new Date(checkoutSession.expiresAt).getTime() < getCurrentTime()) {
      logger().info(
        `checkout session with id ${checkoutSessionId} already expired`,
        {
          useCase: LoggerUseCaseEnum.INVALIDATE_CHECKOUT_SESSION,
          data: {
            expirationDate: new Date(checkoutSession.expiresAt),
          },
        },
      );
      return false;
    }

    const { products } = checkoutSession;

    if (!products || !products.length) {
      throw errors.MISSING_CHECKOUT_SESSION_PRODUCTS();
    }

    try {
      await expireCheckoutSession(checkoutSessionId);

      logger().info("successfully expired checkout session", {
        useCase: LoggerUseCaseEnum.INVALIDATE_CHECKOUT_SESSION,
        data: {
          checkoutSessionId,
        },
      });

      await deleteCheckoutSessionById(checkoutSessionId);

      const updatedProducts = await increaseProductsStock(products);
      await stockClient.updateMany(updatedProducts);
    } catch (error) {
      logger().error("error expiring checkout session", {
        useCase: LoggerUseCaseEnum.INVALIDATE_CHECKOUT_SESSION,
        data: {
          checkoutSessionId,
          error,
        },
      });
    }

    return true;
  },
);
