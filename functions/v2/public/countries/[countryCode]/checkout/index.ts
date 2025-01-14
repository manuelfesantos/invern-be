import { errorResponse, generateErrorResponse } from "@response-entity";
import { CountriesEndpointProtectedData, Env } from "@request-entity";
import { initStripeClient } from "@stripe-adapter";
import { getBodyFromRequest } from "@http-utils";
import { checkout } from "@order-module";
export const onRequest: PagesFunction<
  Env,
  string,
  CountriesEndpointProtectedData
> = async (context): Promise<Response> => {
  const { request, env, data } = context;

  initStripeClient(env.STRIPE_API_KEY);
  if (request.method !== "POST") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  try {
    const { headers } = request;
    const { cartId, userId, refreshToken, accessToken, remember } = data;

    const body = await getBodyFromRequest(request);
    const origin = headers.get("origin") || undefined;
    return await checkout(
      { refreshToken, accessToken },
      remember,
      userId,
      cartId,
      body,
      origin,
    );
  } catch (error) {
    return generateErrorResponse(error);
  }
};
