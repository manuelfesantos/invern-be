import { protectedSuccessResponse } from "@response-entity";
// eslint-disable-next-line import/no-restricted-paths
import { initStripeClient } from "@stripe-adapter";
import { getCookieHeader, setCookieInResponse } from "@http-utils";
import { getCheckoutSession } from "@order-module";
import { encrypt } from "@crypto-utils";
import { CookieNameEnum } from "@http-entity";
import { SESSION_EXPIRY } from "@timer-utils";
import { PagesFunction } from "@cloudflare/workers-types";
import { Env } from "@request-entity";
import { isCheckoutStageEnabled, checkoutRequestHandler } from "@context-utils";
import { CheckoutStageNameEnum } from "@checkout-session-entity";
import { errors } from "@error-handling-utils";

const GET: PagesFunction<Env> = async ({ request, env }): Promise<Response> => {
  if (!isCheckoutStageEnabled(CheckoutStageNameEnum.REVIEW)) {
    throw errors.NOT_ALLOWED("Payment checkout stage is not enabled");
  }

  initStripeClient(env.STRIPE_API_KEY);

  const { headers } = request;

  const origin = headers.get("origin") || undefined;
  const { url, checkoutSessionId } = await getCheckoutSession(origin);

  const checkoutSessionToken = await encrypt(checkoutSessionId);

  const checkoutSessionCookie = getCookieHeader(
    CookieNameEnum.CHECKOUT_SESSION,
    checkoutSessionToken,
    SESSION_EXPIRY,
  );

  const response = protectedSuccessResponse.OK("checkout session created", {
    url,
  });

  setCookieInResponse(response, checkoutSessionCookie);

  return response;
};

export const onRequest = checkoutRequestHandler({ GET }, null);
