import { errorResponse, generateErrorResponse } from "@response-entity";
import { getUserOrders } from "@order-module";

export const onRequest: PagesFunction = async (context) => {
  const { request } = context;
  if (request.method !== "GET") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  const { headers } = request;

  const userId = headers.get("userId");

  if (!userId) {
    return errorResponse.BAD_REQUEST("userId is required");
  }

  try {
    return getUserOrders(userId);
  } catch (error) {
    return generateErrorResponse(error);
  }
};
