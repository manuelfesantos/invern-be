import { Hono } from "hono";
import { Buffer } from "node:buffer";
import type { HonoEnv } from "../../types/hono";
import { errorResponse, prepareError, successResponse } from "@response-entity";
import { isStripeEnvValid } from "@http-utils";
import type { StripeEvent } from "@stripe-entity";
import {
  isStripePaymentIntent,
  isStripeSessionExpiredEvent,
  isStripeSessionResultEvent,
} from "@stripe-entity";
import {
  getOrderFromSessionResult,
  handleSessionExpiredEvent,
  mapPaymentIntentEvent,
} from "@order-module";
import { stringifyObject } from "@string-utils";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { errors } from "@error-handling-utils";
import { stripe } from "@stripe-adapter";
import { ENV } from "@env-utils";

const stripeRoutes = new Hono<HonoEnv>();

/** Verify the signature and construct the event, or return the error response. */
const constructEvent = async (
  request: Request,
  secret: string,
): Promise<StripeEvent | Response> => {
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return errorResponse.UNAUTHORIZED();
  }

  const bodyBuffer = Buffer.from(await request.arrayBuffer());
  try {
    return await stripe().webhooks.constructEventAsync(bodyBuffer, sig, secret);
  } catch (err) {
    if (err instanceof Error) {
      return errorResponse.BAD_REQUEST(`Webhook Error: ${err.message}`);
    }
    return errorResponse.BAD_REQUEST(`Webhook Error: Unknown error: ${err}`);
  }
};

stripeRoutes.post("/session-result", async (c) => {
  const event = await constructEvent(c.req.raw, ENV.STRIPE_CHECKOUT_SECRET);
  if (event instanceof Response) {
    return event;
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

  if (isStripeSessionExpiredEvent(event)) {
    logger().info("Session expired event received", {
      useCase: LoggerUseCaseEnum.HANDLE_CHECKOUT_SESSION,
      data: { sessionExpired: stringifyObject(event) },
    });
    return successResponse.OK(await handleSessionExpiredEvent(sessionEvent));
  }

  logger().info("Session completed event received", {
    useCase: LoggerUseCaseEnum.HANDLE_CHECKOUT_SESSION,
    data: { checkoutSessionResult: stringifyObject(event) },
  });
  const clientOrder = await getOrderFromSessionResult(sessionEvent);

  return successResponse.OK("success getting checkout-session", clientOrder);
});

stripeRoutes.post("/payment-intent", async (c) => {
  const event = await constructEvent(c.req.raw, ENV.STRIPE_PAYMENT_SECRET);
  if (event instanceof Response) {
    return event;
  }

  const paymentIntent = event.data.object;

  if (!isStripePaymentIntent(paymentIntent)) {
    throw errors.INVALID_PAYLOAD(
      "Payload is not a Stripe Payment Intent Event",
    );
  }

  if (!isStripeEnvValid(paymentIntent)) {
    return successResponse.OK("Unsupported event, ignoring request");
  }

  logger().addRedactedData({ checkoutPaymentIntent: stringifyObject(event) });
  const payment = await mapPaymentIntentEvent(paymentIntent, event.type);
  logger().addRedactedData({ createdPayment: stringifyObject(payment) });

  return successResponse.OK("success getting checkout-session");
});

export default stripeRoutes;
