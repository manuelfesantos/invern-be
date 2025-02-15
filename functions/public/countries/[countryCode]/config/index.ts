import { deleteCookieFromResponse, getCookies } from "@http-utils";
import { getConfig } from "@config-module";
import { invalidateCheckoutSession } from "@order-module";
import { decrypt } from "@crypto-utils";
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
    [CookieNameEnum.REFRESH_TOKEN]: refreshToken,
    [CookieNameEnum.CHECKOUT_SESSION]: checkoutSessionCookie,
    [CookieNameEnum.REMEMBER]: remember,
  } = cookies;

  const response = await getConfig(
    request.headers,
    refreshToken,
    remember === "true",
  );

  const ignoreCheckoutSessionCookie = response.headers.get(
    "ignore-checkout-session-cookie",
  );

  if (!ignoreCheckoutSessionCookie) {
    if (checkoutSessionCookie) {
      logger().info("deleting checkout session cookie", {
        useCase: LoggerUseCaseEnum.INVALIDATE_CHECKOUT_SESSION,
      });
      initStripeClient(env.STRIPE_API_KEY);

      await invalidateCheckoutSession(await decrypt(checkoutSessionCookie));

      deleteCookieFromResponse(response, CookieNameEnum.CHECKOUT_SESSION);
    }
  } else {
    logger().info("ignoring checkout session cookie", {
      useCase: LoggerUseCaseEnum.INVALIDATE_CHECKOUT_SESSION,
    });

    deleteCookieFromResponse(response, CookieNameEnum.CHECKOUT_SESSION);
  }

  return response;
};

export const onRequest = requestHandler({ GET });
