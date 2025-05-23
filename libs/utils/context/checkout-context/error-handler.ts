import { middlewareRequestHandler, requestHandler } from "@decorator-utils";
import { CookieName, Data, HandlerMethodMapper } from "@http-entity";
import { Env } from "@env-entity";
import {
  contextStore,
  getClientCheckoutStages,
  getRemoveCookieNamesFromInvalidCheckoutStage,
} from "@context-utils";
import {
  CheckoutStageName,
  checkoutStageToCookie,
} from "@checkout-session-entity";
import {
  errorResponse,
  protectedSuccessResponse,
  successResponse,
} from "@response-entity";
import { deleteCookieFromResponse } from "@http-utils";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";

export const checkoutRequestHandler = <T extends Data>(
  methodMapper: HandlerMethodMapper<T>,
  checkoutStage: CheckoutStageName | null,
): PagesFunction<Env, string, T> => {
  return requestHandler(methodMapper, {
    errorHandler,
    preProcess: () => initializeCheckoutStage(checkoutStage),
  });
};

export const checkoutMiddlewareRequestHandler = <T extends Data>(
  fn: PagesFunction<Env, string, T>,
): PagesFunction<Env, string, T> => {
  return middlewareRequestHandler(fn, { errorHandler });
};

const errorHandler = (error: unknown): Response => {
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

const initializeCheckoutStage = (
  checkoutStage: CheckoutStageName | null,
): void => {
  if (checkoutStage) {
    contextStore.context.currentCheckoutStage = checkoutStage;
  }
};

const getAllCheckoutCookies = (): CookieName[] => {
  return Object.values(checkoutStageToCookie);
};
