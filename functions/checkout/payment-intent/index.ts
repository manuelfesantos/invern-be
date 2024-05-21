import { errorResponse, successResponse } from "@response-entity";
import { getBodyFromRequest } from "@http-utils";
import { getLogger } from "@logger-utils";
const NUMBER_2 = 2;
export const onRequest: PagesFunction = async (context) => {
  const { request } = context;
  if (request.method !== "POST") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }
  const body = await getBodyFromRequest(request);
  const logger = getLogger();
  logger.addData({
    checkoutPaymentIntent: JSON.stringify(body, null, NUMBER_2),
  });
  return successResponse.OK("success getting checkout-session");
};
