import { successResponse } from "@response-entity";
import { getBodyFromRequest, isStripeEnvValid } from "@http-utils";
import { mapPaymentIntentEvent } from "@order-module";
import { stringifyObject } from "@string-utils";
import { logger } from "@logger-utils";
import { isStripeEvent, isStripePaymentIntent } from "@stripe-entity";
import { errors } from "@error-handling-utils";
import { requestHandler } from "@decorator-utils";
import { Env } from "@request-entity";
// eslint-disable-next-line import/no-restricted-paths
import { initStripeClient } from "@stripe-adapter";

const POST: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  initStripeClient(env.STRIPE_API_KEY);

  const body = await getBodyFromRequest(request);

  if (!isStripeEvent(body)) {
    throw errors.INVALID_PAYLOAD("Payload is not a Stripe Event");
  }

  const paymentIntent = body.data.object;

  if (!isStripePaymentIntent(paymentIntent)) {
    throw errors.INVALID_PAYLOAD(
      "Payload is not a Stripe Payment Intent Event",
    );
  }

  if (!isStripeEnvValid(paymentIntent)) {
    return successResponse.OK("Unsupported event, ignoring request");
  }

  logger().addRedactedData({
    checkoutPaymentIntent: stringifyObject(body),
  });

  const payment = await mapPaymentIntentEvent(paymentIntent, body.type);

  logger().addRedactedData({ createdPayment: stringifyObject(payment) });
  return successResponse.OK("success getting checkout-session");
};

export const onRequest = requestHandler({ POST });
