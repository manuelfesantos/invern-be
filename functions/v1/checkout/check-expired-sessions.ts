import { checkExpiredCheckoutSessions } from "@order-module";
import { errorResponse, generateErrorResponse } from "@response-entity";
import { HttpMethodEnum } from "@http-entity";

export const onRequest: PagesFunction = async ({ request }) => {
  if (request.method !== HttpMethodEnum.POST) {
    return errorResponse.METHOD_NOT_ALLOWED();
  }
  try {
    return checkExpiredCheckoutSessions();
  } catch (error) {
    return generateErrorResponse(error);
  }
};
