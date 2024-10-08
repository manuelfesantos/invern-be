import { errorResponse, generateErrorResponse } from "@response-entity";
import { getBodyFromRequest } from "@http-utils";
import { HttpHeaderEnum, HttpMethodEnum } from "@http-entity";
import { getCredentials } from "@jwt-utils";
import { cartActionMapper } from "@cart-module";

export const onRequest: PagesFunction = async (context) => {
  const { request } = context;
  if (request.method !== HttpMethodEnum.POST) {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  const { headers } = request;

  try {
    const { userId, cartId, refreshToken, accessToken, remember } =
      (await getCredentials(headers)) ?? {};

    const action = headers.get(HttpHeaderEnum.ACTION);

    const body = await getBodyFromRequest(request);

    return await cartActionMapper(
      { refreshToken, accessToken },
      remember,
      body,
      action,
      cartId,
      userId,
    );
  } catch (error) {
    return generateErrorResponse(error);
  }
};
