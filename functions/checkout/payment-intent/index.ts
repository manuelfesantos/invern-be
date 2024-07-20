import {
  errorResponse,
  generateErrorResponse,
  successResponse,
} from "@response-entity";
import { getBodyFromRequest } from "@http-utils";
import { getLogger } from "@logger-utils";
import { mapPaymentIntentEvent } from "@order-module";

const NUMBER_2 = 2;
export const onRequest: PagesFunction = async (context) => {
  const { request } = context;

  if (request.method !== "POST") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  try {
    const body = await getBodyFromRequest(request);

    const logger = getLogger();

    logger.addData({
      checkoutPaymentIntent: JSON.stringify(body, null, NUMBER_2),
    });

    const payment = await mapPaymentIntentEvent(body);

    logger.addData({ createdPayment: JSON.stringify(payment, null, NUMBER_2) });
    return successResponse.OK("success getting checkout-session");
  } catch (error) {
    return generateErrorResponse(error);
  }
};
