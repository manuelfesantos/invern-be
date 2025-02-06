import { protectedSuccessResponse } from "@response-entity";
// eslint-disable-next-line import/no-restricted-paths
import { initStripeClient } from "@stripe-adapter";
import { getCookieHeader, setCookieInResponse } from "@http-utils";
import { checkout } from "@order-module";
import { encrypt } from "@crypto-utils";
import { CookieNameEnum } from "@http-entity";
import { SESSION_EXPIRY } from "@timer-utils";
import { requestHandler } from "@decorator-utils";
import { PagesFunction } from "@cloudflare/workers-types";
import { Env } from "@request-entity";

const GET: PagesFunction<Env> = async ({ request, env }): Promise<Response> => {
  initStripeClient(env.STRIPE_API_KEY);

  const { headers } = request;

  const origin = headers.get("origin") || undefined;
  const { url, checkoutSessionId } = await checkout(origin);

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

export const onRequest = requestHandler({ GET });
