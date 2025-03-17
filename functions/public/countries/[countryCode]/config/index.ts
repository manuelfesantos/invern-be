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
import { CookieNameEnum } from "@http-entity";
import { requestHandler } from "@decorator-utils";
import { PagesFunction } from "@cloudflare/workers-types";
import { UserDetails } from "@user-entity";

const GET: PagesFunction = async ({ request }): Promise<Response> => {
  const cookies = getCookies(request.headers);

  const {
    [CookieNameEnum.REFRESH_TOKEN]: refreshToken,
    [CookieNameEnum.CHECKOUT_SESSION]: checkoutSessionCookie,
    [CookieNameEnum.REMEMBER]: remember,
    [CookieNameEnum.USER_DETAILS]: encryptedUserDetails,
  } = cookies;

  const afterCheckoutHeader = request.headers.get("after-checkout");

  const afterCheckoutProcessing = afterCheckoutHeader === "true";

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
};

export const onRequest = requestHandler({ GET });
