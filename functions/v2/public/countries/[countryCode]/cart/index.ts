import { errorResponse, generateErrorResponse } from "@response-entity";
import { getBodyFromRequest } from "@http-utils";
import { HttpHeaderEnum, HttpMethodEnum } from "@http-entity";
import { cartActionMapper } from "@cart-module";
import { CountriesEndpointProtectedData, Env } from "@request-entity";

export const onRequest: PagesFunction<
  Env,
  string,
  CountriesEndpointProtectedData
> = async (context) => {
  const { request, data } = context;
  if (request.method !== HttpMethodEnum.POST) {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  const { headers } = request;

  try {
    const { userId, cartId, refreshToken, accessToken, remember } = data;

    const action = headers.get(HttpHeaderEnum.ACTION);

    const body = await getBodyFromRequest(request);

    return await cartActionMapper(
      { refreshToken, accessToken },
      remember,
      body,
      action,
      cartId,
      userId,
      data.country,
    );
  } catch (error) {
    return generateErrorResponse(error);
  }
};
