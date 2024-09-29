import {
  errorResponse,
  generateErrorResponse,
  successResponse,
} from "@response-entity";
import { getBodyFromRequest } from "@http-utils";
import { mapPaymentIntentEvent } from "@order-module";
import { stringifyObject } from "@string-utils";
import { logger } from "@logger-utils";

export const onRequest: PagesFunction = async (context) => {
  const { request } = context;

  if (request.method !== "POST") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  try {
    const body = await getBodyFromRequest(request);

    logger().addData({
      checkoutPaymentIntent: stringifyObject(body),
    });

    const payment = await mapPaymentIntentEvent(body);

    logger().addData({ createdPayment: stringifyObject(payment) });
    return successResponse.OK("success getting checkout-session");
  } catch (error) {
    return generateErrorResponse(error);
  }
};
