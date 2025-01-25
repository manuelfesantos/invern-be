import { deleteCookieFromResponse, getCookies } from "@http-utils";
import { getConfig } from "@config-module";
import { invalidateCheckoutSession } from "@order-module";
import { base64Decode } from "@crypto-utils";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
// eslint-disable-next-line import/no-restricted-paths
import { initStripeClient } from "@stripe-adapter";
import { CookieNameEnum } from "@http-entity";
import { requestHandler } from "@decorator-utils";
import { PagesFunction } from "@cloudflare/workers-types";
import { Env } from "@request-entity";

const GET: PagesFunction<Env> = async ({ request, env }): Promise<Response> => {
  const cookies = getCookies(request.headers);

  const {
    s_r: refreshToken,
    c_s: checkoutSessionCookie,
    r_m: remember,
  } = cookies;

  const response = await getConfig(
    request.headers,
    refreshToken,
    remember === "true",
  );

  if (checkoutSessionCookie) {
    logger().info(
      "deleting checkout session cookie",
      LoggerUseCaseEnum.INVALIDATE_CHECKOUT_SESSION,
    );
    initStripeClient(env.STRIPE_API_KEY);

    await invalidateCheckoutSession(base64Decode(checkoutSessionCookie));

    deleteCookieFromResponse(response, CookieNameEnum.CHECKOUT_SESSION);
  }

  return response;
};

export const onRequest = requestHandler({ GET });
