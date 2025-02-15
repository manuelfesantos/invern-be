import { PagesFunction } from "@cloudflare/workers-types";
import { middlewareRequestHandler, requestHandler } from "@decorator-utils";
import { CookieName, Data, HandlerMethodMapper } from "@http-entity";
import { Env } from "@request-entity";
import {
  contextStore,
  getClientCheckoutStages,
  getRemoveCookieNamesFromInvalidCheckoutStage,
} from "@context-utils";
import {
  CheckoutStageName,
  checkoutStageToCookie,
} from "@checkout-session-entity";
import { errorResponse, protectedSuccessResponse } from "@response-entity";
import { deleteCookieFromResponse } from "@http-utils";

export const checkoutRequestHandler = <T extends Data>(
  methodMapper: HandlerMethodMapper<T>,
  checkoutStage: CheckoutStageName | null,
): PagesFunction<Env, string, T> => {
  return requestHandler(methodMapper, errorHandler, () =>
    initializeCheckoutStage(checkoutStage),
  );
};

export const checkoutMiddlewareRequestHandler = <T extends Data>(
  fn: PagesFunction<Env, string, T>,
): PagesFunction<Env, string, T> => {
  return middlewareRequestHandler(fn, errorHandler);
};

const errorHandler = (error: unknown): Response => {
  const { currentCheckoutStage } = contextStore.context;
  if (error instanceof Error && currentCheckoutStage) {
    const cookiesToRemove = getCookiesToRemove(currentCheckoutStage);
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
    const response = protectedSuccessResponse.OK(
      error.message,
      {
        isCheckoutPossible: false,
      },
      undefined,
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

const getCookiesToRemove = (
  checkoutStageName: CheckoutStageName,
): CookieName[] =>
  getRemoveCookieNamesFromInvalidCheckoutStage(checkoutStageName);

const initializeCheckoutStage = (
  checkoutStage: CheckoutStageName | null,
): void => {
  checkoutStage && (contextStore.context.currentCheckoutStage = checkoutStage);
};

const getAllCheckoutCookies = (): CookieName[] => {
  return Object.values(checkoutStageToCookie);
};
