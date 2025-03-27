import { errorResponse, prepareError, successResponse } from "@response-entity";
import { getBodyFromRequest, isStripeEnvValid } from "@http-utils";
import {
  isStripeSessionExpiredEvent,
  isStripeSessionResultEvent,
} from "@stripe-entity";
import {
  getOrderFromSessionResult,
  handleSessionExpiredEvent,
} from "@order-module";
import { stringifyObject } from "@string-utils";
import { logger } from "@logger-utils";
import { requestHandler } from "@decorator-utils";
import { PagesFunction } from "@cloudflare/workers-types";
import { LoggerUseCaseEnum } from "@logger-entity";

export const POST: PagesFunction = async (context) => {
  const { request } = context;
  const body = await getBodyFromRequest(request);

  if (!isStripeSessionResultEvent(body)) {
    return errorResponse.BAD_REQUEST(
      prepareError("Invalid checkout session result"),
    );
  }

  const { object: sessionEvent } = body.data;

  if (!isStripeEnvValid(sessionEvent)) {
    return successResponse.OK("Unsupported event, ignoring request");
  }

  // Handle session expired event
  if (isStripeSessionExpiredEvent(body)) {
    logger().info("Session expired event received", {
      useCase: LoggerUseCaseEnum.HANDLE_CHECKOUT_SESSION,
      data: { sessionExpired: stringifyObject(body) },
    });

    const message = await handleSessionExpiredEvent(sessionEvent);
    return successResponse.OK(message);
  }

  // Handle session completed event
  logger().info("Session completed event received", {
    useCase: LoggerUseCaseEnum.HANDLE_CHECKOUT_SESSION,
    data: { checkoutSessionResult: stringifyObject(body) },
  });
  const clientOrder = await getOrderFromSessionResult(sessionEvent);

  return successResponse.OK("success getting checkout-session", clientOrder);
};

export const onRequest = requestHandler({ POST });
