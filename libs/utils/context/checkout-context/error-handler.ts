import type { CookieName } from "@http-entity";
import {
  contextStore,
  getClientCheckoutStages,
  getRemoveCookieNamesFromInvalidCheckoutStage,
} from "@context-utils";
import type { CheckoutStageName } from "@checkout-session-entity";
import { checkoutStageToCookie } from "@checkout-session-entity";
import {
  errorResponse,
  protectedSuccessResponse,
  successResponse,
} from "@response-entity";
import { deleteCookieFromResponse } from "@http-utils";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";

/**
 * Marks the active checkout stage so {@link checkoutErrorHandler} can scope its
 * cookie cleanup to that stage.
 */
export const initializeCheckoutStage = (
  checkoutStage: CheckoutStageName | null,
): void => {
  if (checkoutStage) {
    contextStore.context.currentCheckoutStage = checkoutStage;
  }
};

/**
 * Renders a thrown checkout error gracefully (checkout never surfaces a hard
 * error to the client): inside a stage it returns the still-available stages
 * and clears cookies for the now-invalid stage; otherwise it reports the cart
 * as un-checkout-able and clears every checkout cookie.
 */
export const checkoutErrorHandler = (error: unknown): Response => {
  const { currentCheckoutStage } = contextStore.context;
  if (error instanceof Error && currentCheckoutStage) {
    const cookiesToRemove = getCheckoutCookiesToRemove(currentCheckoutStage);
    logger().error(
      `Error in checkout stage ${currentCheckoutStage}: ${error.message}`,
      {
        useCase: LoggerUseCaseEnum.CHECKOUT_ERROR,
        data: {
          error,
          checkoutStage: currentCheckoutStage,
        },
      },
    );
    const response = protectedSuccessResponse.OK(
      error.message,
      {
        availableCheckoutStages: getClientCheckoutStages(),
      },
      undefined,
      undefined,
      [error.message],
    );
    cookiesToRemove.forEach((cookie) =>
      deleteCookieFromResponse(response, cookie),
    );
    return response;
  }
  if (error instanceof Error) {
    const response = successResponse.OK(
      error.message,
      {
        isCheckoutPossible: false,
      },
      undefined,
      [error.message],
    );
    getAllCheckoutCookies().forEach((cookie) =>
      deleteCookieFromResponse(response, cookie),
    );
    return response;
  }

  const response = errorResponse.INTERNAL_SERVER_ERROR();
  getAllCheckoutCookies().forEach((cookie) =>
    deleteCookieFromResponse(response, cookie),
  );
  return response;
};

const getCheckoutCookiesToRemove = (
  checkoutStageName: CheckoutStageName,
): CookieName[] =>
  getRemoveCookieNamesFromInvalidCheckoutStage(checkoutStageName);

const getAllCheckoutCookies = (): CookieName[] => {
  return Object.values(checkoutStageToCookie);
};
