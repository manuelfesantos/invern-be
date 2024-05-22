import { errorResponse, generateErrorResponse } from "@response-entity";
import { Env } from "@request-entity";
import { initStripeClient } from "@stripe-adapter";
import { setGlobalTimer } from "@timer-utils";
import { getBodyFromRequest } from "@http-utils";
import { HttpHeaderEnum } from "@http-entity";
import { checkout } from "@order-module";
export const onRequest: PagesFunction<Env> = async (
  context,
): Promise<Response> => {
  setGlobalTimer();
  const { request, env } = context;

  initStripeClient(env.STRIPE_API_KEY);
  if (request.method !== "POST") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }
  const cartId = request.headers.get(HttpHeaderEnum.CART_ID);
  try {
    if (cartId) {
      return await checkout(cartId);
    }
    const body = await getBodyFromRequest(request);
    return await checkout(null, body);
  } catch (error) {
    return generateErrorResponse(error);
  }
};
