import { initStripeClient } from "@stripe-adapter";
import { Env } from "@request-entity";
import {
  errorResponse,
  generateErrorResponse,
  successResponse,
} from "@response-entity";
import { getCredentials } from "@jwt-utils";
import { parse } from "cookie";
import { HttpHeaderEnum, HttpMethodEnum } from "@http-entity";
import { invalidateCheckoutCookiePayloadSchema } from "@order-entity";
import { invalidateCheckoutSession } from "@order-module";

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  initStripeClient(env.STRIPE_API_KEY);
  if (request.method !== HttpMethodEnum.DELETE) {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  try {
    const { headers } = request;
    const { refreshToken, accessToken, remember } =
      await getCredentials(headers);
    const cookies = parse(headers.get(HttpHeaderEnum.COOKIE) ?? "");
    const { c_s: checkoutSessionCookie } = cookies;
    const { checkoutSessionId, expiresAt } =
      invalidateCheckoutCookiePayloadSchema.parse(checkoutSessionCookie) || {};

    if (!checkoutSessionId || !expiresAt) {
      return successResponse.OK("checkout session already invalidated");
    }
    if (Date.now() > expiresAt) {
      return successResponse.OK("checkout session already invalidated");
    }
    return invalidateCheckoutSession(
      { refreshToken, accessToken },
      remember,
      checkoutSessionId,
    );
  } catch (error) {
    return generateErrorResponse(error);
  }
};
