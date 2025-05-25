import { errorResponse, prepareError, successResponse } from "@response-entity";
import { isStripeEnvValid } from "@http-utils";
import {
  isStripeSessionExpiredEvent,
  isStripeSessionResultEvent,
  StripeEvent,
} from "@stripe-entity";
import {
  getOrderFromSessionResult,
  handleSessionExpiredEvent,
} from "@order-module";
import { stringifyObject } from "@string-utils";
import { logger } from "@logger-utils";
import { requestHandler } from "@decorator-utils";
import { LoggerUseCaseEnum } from "@logger-entity";

// eslint-disable-next-line import/no-restricted-paths
import { stripe } from "@stripe-adapter";
import { ENV } from "@env-utils";
import { Buffer } from "node:buffer";

export const POST: PagesFunction = async (context) => {
  const { request } = context;
  const bodyBuffer = Buffer.from(await request.arrayBuffer());

  let event: StripeEvent;

  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return errorResponse.UNAUTHORIZED();
  }

  try {
    event = await stripe().webhooks.constructEventAsync(
      bodyBuffer,
      sig,
      ENV.STRIPE_CHECKOUT_SECRET,
    );
  } catch (err) {
    if (err instanceof Error) {
      return errorResponse.BAD_REQUEST(`Webhook Error: ${err.message}`);
    }
    return errorResponse.BAD_REQUEST(`Webhook Error: Unknown error: ${err}`);
  }

  if (!isStripeSessionResultEvent(event)) {
    return errorResponse.BAD_REQUEST(
      prepareError("Invalid checkout session result"),
    );
  }

  const {
    data: { object: sessionEvent },
  } = event;

  if (!isStripeEnvValid(sessionEvent)) {
    return successResponse.OK("Unsupported event, ignoring request");
  }

  // Handle session expired event
  if (isStripeSessionExpiredEvent(event)) {
    logger().info("Session expired event received", {
      useCase: LoggerUseCaseEnum.HANDLE_CHECKOUT_SESSION,
      data: { sessionExpired: stringifyObject(event) },
    });

    const message = await handleSessionExpiredEvent(sessionEvent);
    return successResponse.OK(message);
  }

  // Handle session completed event
  logger().info("Session completed event received", {
    useCase: LoggerUseCaseEnum.HANDLE_CHECKOUT_SESSION,
    data: { checkoutSessionResult: stringifyObject(event) },
  });
  const clientOrder = await getOrderFromSessionResult(sessionEvent);

  return successResponse.OK("success getting checkout-session", clientOrder);
};

export const onRequest = requestHandler({ POST });
