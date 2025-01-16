import {
  errorResponse,
  generateErrorResponse,
  successResponse,
} from "@response-entity";
import { getBodyFromRequest, isStripeEnvValid } from "@http-utils";
import { mapPaymentIntentEvent } from "@order-module";
import { stringifyObject } from "@string-utils";
import { logger } from "@logger-utils";
import { isStripeEvent, isStripePaymentIntent } from "@stripe-entity";
import { errors } from "@error-handling-utils";

export const onRequest: PagesFunction = async (context) => {
  const { request } = context;

  if (request.method !== "POST") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  try {
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

    logger().addData({
      checkoutPaymentIntent: stringifyObject(body),
    });

    const payment = await mapPaymentIntentEvent(paymentIntent, body.type);

    logger().addData({ createdPayment: stringifyObject(payment) });
    return successResponse.OK("success getting checkout-session");
  } catch (error) {
    return generateErrorResponse(error);
  }
};
