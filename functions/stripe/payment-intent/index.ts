import { errorResponse, successResponse } from "@response-entity";
import { isStripeEnvValid } from "@http-utils";
import { mapPaymentIntentEvent } from "@order-module";
import { stringifyObject } from "@string-utils";
import { logger } from "@logger-utils";
import { isStripePaymentIntent, StripeEvent } from "@stripe-entity";
import { errors } from "@error-handling-utils";
import { requestHandler } from "@decorator-utils";
import { Buffer } from "node:buffer";

// eslint-disable-next-line import/no-restricted-paths
import { stripe } from "@stripe-adapter";
import { ENV } from "@env-utils";

const POST: PagesFunction = async (context) => {
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
      ENV.STRIPE_PAYMENT_SECRET,
    );
  } catch (err) {
    if (err instanceof Error) {
      return errorResponse.BAD_REQUEST(`Webhook Error: ${err.message}`);
    }
    return errorResponse.BAD_REQUEST(`Webhook Error: Unknown error: ${err}`);
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

  logger().addRedactedData({
    checkoutPaymentIntent: stringifyObject(event),
  });

  const payment = await mapPaymentIntentEvent(paymentIntent, event.type);

  logger().addRedactedData({ createdPayment: stringifyObject(payment) });
  return successResponse.OK("success getting checkout-session");
};

export const onRequest = requestHandler({ POST });
