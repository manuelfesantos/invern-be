import { errorResponse, generateErrorResponse } from "@response-entity";
import { getUserOrders } from "@order-module";
import { getCredentials } from "@jwt-utils";

export const onRequest: PagesFunction = async (context) => {
  const { request } = context;
  if (request.method !== "GET") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  const { headers } = request;

  try {
    const { userId, remember, refreshToken, accessToken } =
      await getCredentials(headers);

    if (!userId) {
      return errorResponse.UNAUTHORIZED();
    }

    return getUserOrders({ refreshToken, accessToken }, remember, userId);
  } catch (error) {
    return generateErrorResponse(error);
  }
};
