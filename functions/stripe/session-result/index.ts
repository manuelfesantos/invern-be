import {
  errorResponse,
  generateErrorResponse,
  prepareError,
  successResponse,
} from "@response-entity";
import { getBodyFromRequest, isStripeEnvValid } from "@http-utils";
import { sendEmail } from "@mail-utils";
import {
  isStripeEvent,
  isStripeSessionCompletedEvent,
  isStripeSessionExpiredEvent,
} from "@stripe-entity";
import {
  getOrderFromSessionResult,
  handleSessionExpiredEvent,
} from "@order-module";
import { stringifyObject } from "@string-utils";
import { logger } from "@logger-utils";

export const onRequest: PagesFunction = async (context) => {
  const { request } = context;
  if (request.method !== "POST") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }
  try {
    const body = await getBodyFromRequest(request);

    if (!isStripeEvent(body)) {
      return errorResponse.BAD_REQUEST(
        prepareError("Invalid checkout session result"),
      );
    }

    if (isStripeSessionExpiredEvent(body)) {
      const { object: sessionEvent } = body.data;

      if (!isStripeEnvValid(sessionEvent)) {
        return successResponse.OK("Unsupported event, ignoring request");
      }

      logger().addRedactedData({
        sessionExpired: stringifyObject(body),
      });

      return await handleSessionExpiredEvent(sessionEvent);
    }

    if (!isStripeSessionCompletedEvent(body)) {
      return errorResponse.BAD_REQUEST(
        prepareError("Invalid checkout session result"),
      );
    }

    const { object: sessionEvent } = body.data;

    if (!isStripeEnvValid(sessionEvent)) {
      return successResponse.OK("Unsupported event, ignoring request");
    }

    logger().addRedactedData({
      checkoutSessionResult: stringifyObject(body),
    });
    const clientOrder = await getOrderFromSessionResult(sessionEvent);
    await sendEmail(
      sessionEvent.customer_details?.email || "",
      "Checkout",
      `Thank you for purchasing with Invern Spirit, your order's total is ${sessionEvent.amount_total}`,
    );
    logger().addRedactedData({
      createdOrder: stringifyObject(clientOrder),
    });
    return successResponse.OK("success getting checkout-session", clientOrder);
  } catch (error) {
    return generateErrorResponse(error);
  }
};
