import { errorResponse, successResponse } from "@response-entity";
import { getBodyFromRequest } from "@http-utils";
import { getLogger } from "@logger-utils";
import { sendEmail } from "@mail-utils";
import { isStripeSessionCompletedEvent } from "@stripe-entity";

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
  const responsePromise = await sendEmail(
    sessionEvent.customer_details?.email || "",
    "Checkout",
    String(sessionEvent.amount_total),
  );
  const response = await responsePromise.json();
  logger.addData({ emailResponse: JSON.stringify(response, null, NUMBER_2) });
  return successResponse.OK("success getting checkout-session", response);
};
