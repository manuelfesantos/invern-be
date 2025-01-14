import { errorResponse, generateErrorResponse } from "@response-entity";
import { getUserOrders } from "@order-module";
import { CountriesEndpointProtectedData, Env } from "@request-entity";

export const onRequest: PagesFunction<
  Env,
  string,
  CountriesEndpointProtectedData
> = async (context) => {
  const { request, data } = context;
  if (request.method !== "GET") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  try {
    const { userId, remember, refreshToken, accessToken } = data;

    if (!userId) {
      return errorResponse.UNAUTHORIZED();
    }

    return getUserOrders({ refreshToken, accessToken }, remember, userId);
  } catch (error) {
    return generateErrorResponse(error);
  }
};
