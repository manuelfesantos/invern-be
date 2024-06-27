import { errorResponse, successResponse } from "@response-entity";
import { getBodyFromRequest } from "@http-utils";
import { getLogger } from "@logger-utils";
import { sendEmail } from "@mail-utils";
import { isStripeSessionCompletedEvent } from "@stripe-entity";
import { getSessionResult } from "@order-module";

const NUMBER_2 = 2;
export const onRequest: PagesFunction = async (context) => {
  const { request } = context;
  if (request.method !== "POST") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }
  const body = await getBodyFromRequest(request);

  if (!isStripeSessionCompletedEvent(body)) {
    return errorResponse.BAD_REQUEST();
  }

  const { object: sessionEvent } = body.data;

  const logger = getLogger();
  logger.addData({
    checkoutSessionResult: JSON.stringify(body, null, NUMBER_2),
  });
  const order = await getSessionResult(sessionEvent);
  await sendEmail(
    sessionEvent.customer_details?.email || "",
    "Checkout",
    `Thank you for purchasing with Invern Spirit, your order's total is ${sessionEvent.amount_total}`,
  );
  logger.addData({ createdOrder: JSON.stringify(order, null, NUMBER_2) });
  return successResponse.OK("success getting checkout-session", order);
};
