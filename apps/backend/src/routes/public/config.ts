import { Hono } from "hono";
import type { HonoEnv } from "../../types/hono";
import { CookieNameEnum } from "@http-entity";
import {
  deleteCheckoutCookiesFromResponse,
  deleteCookieFromResponse,
  getCookies,
  setCustomerEmailCookieInResponse,
} from "@http-utils";
import { getConfig } from "@config-module";
import { invalidateCheckoutSession } from "@order-module";
import { decrypt, decryptObjectString, encrypt } from "@crypto-utils";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import type { UserDetails } from "@user-entity";

const config = new Hono<HonoEnv>();

config.get("/", async (c) => {
  const request = c.req.raw;
  const cookies = getCookies(request.headers);
  const {
    [CookieNameEnum.REFRESH_TOKEN]: refreshToken,
    [CookieNameEnum.CHECKOUT_SESSION]: checkoutSessionCookie,
    [CookieNameEnum.REMEMBER]: remember,
    [CookieNameEnum.USER_DETAILS]: encryptedUserDetails,
  } = cookies;

  const afterCheckoutProcessing =
    request.headers.get("after-checkout") === "true";

  if (checkoutSessionCookie && !afterCheckoutProcessing) {
    await invalidateCheckoutSession(await decrypt(checkoutSessionCookie));
  }

  const response = await getConfig(
    request.headers,
    refreshToken,
    remember === "true",
  );

  if (!checkoutSessionCookie) {
    return response;
  }

  if (afterCheckoutProcessing) {
    logger().info("ignoring checkout session cookie", {
      useCase: LoggerUseCaseEnum.INVALIDATE_CHECKOUT_SESSION,
    });

    if (encryptedUserDetails) {
      const userDetails =
        await decryptObjectString<UserDetails>(encryptedUserDetails);
      setCustomerEmailCookieInResponse(
        response,
        await encrypt(userDetails.email),
      );
    }

    deleteCheckoutCookiesFromResponse(response);
    deleteCookieFromResponse(response, CookieNameEnum.CART_ID);
    deleteCookieFromResponse(response, CookieNameEnum.CHECKOUT_SESSION);

    return response;
  }

  logger().info("deleting checkout session cookie", {
    useCase: LoggerUseCaseEnum.INVALIDATE_CHECKOUT_SESSION,
  });

  deleteCookieFromResponse(response, CookieNameEnum.CHECKOUT_SESSION);

  return response;
});

export default config;
