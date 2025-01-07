import { errorResponse, generateErrorResponse } from "@response-entity";
import { Env } from "@request-entity";
import { initStripeClient } from "@stripe-adapter";
import { getBodyFromRequest } from "@http-utils";
import { checkout } from "@order-module";
import { getCredentials } from "@jwt-utils";
export const onRequest: PagesFunction<Env> = async (
  context,
): Promise<Response> => {
  const { request, env } = context;

  initStripeClient(env.STRIPE_API_KEY);
  if (request.method !== "POST") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  try {
    const { headers } = request;
    const { cartId, userId, refreshToken, accessToken, remember } =
      await getCredentials(headers);

    const body = await getBodyFromRequest(request);
    const origin = request.headers.get("origin") || undefined;
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
