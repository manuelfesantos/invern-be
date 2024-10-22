import { errorResponse, generateErrorResponse } from "@response-entity";
import { parse } from "cookie";
import { getBodyFromRequest } from "@http-utils";
import { configPayloadSchema, getConfig } from "@config-module";
import { invalidateCheckoutSession } from "@order-module";
import { base64Decode } from "@crypto-utils";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { Env } from "@request-entity";
import { initStripeClient } from "@stripe-adapter";

export const onRequest: PagesFunction<Env> = async (
  context,
): Promise<Response> => {
  let country: string | null = null;
  const { request, env } = context;
  if (request.method !== "POST") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }
  try {
    const body = await getBodyFromRequest(request);

    const {
      country: payloadCountry,
      userVersion,
      remember,
    } = configPayloadSchema.parse(body);

    if (!payloadCountry) {
      country = request.headers.get("country");
    }

    const cookies = parse(request.headers.get("Cookie") ?? "");

    const { s_r: refreshToken, c_s: checkoutSessionCookie } = cookies;

    let deleteCheckoutSessionCookie: string | undefined = undefined;

    if (checkoutSessionCookie) {
      logger().info(
        "deleting checkout session cookie",
        LoggerUseCaseEnum.INVALIDATE_CHECKOUT_SESSION,
      );
      initStripeClient(env.STRIPE_API_KEY);
      deleteCheckoutSessionCookie = await invalidateCheckoutSession(
        base64Decode(checkoutSessionCookie),
      );
    }

    return await getConfig(
      refreshToken,
      country || undefined,
      userVersion,
      remember,
      deleteCheckoutSessionCookie,
    );
  } catch (error) {
    return generateErrorResponse(error);
  }
};
