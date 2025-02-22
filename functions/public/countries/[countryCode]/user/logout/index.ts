import { requestHandler } from "@decorator-utils";
import { PagesFunction } from "@cloudflare/workers-types";
import { logout } from "@user-module";
import { protectedSuccessResponse } from "@response-entity";
import {
  deleteCheckoutCookiesFromResponse,
  deleteCookieFromResponse,
} from "@http-utils";
import { CookieNameEnum } from "@http-entity";

const POST: PagesFunction = async () => {
  const { responseContext, cart } = await logout();

  const response = protectedSuccessResponse.OK(
    "successfully logged out",
    { cart },
    undefined,
    responseContext,
  );

  deleteCookieFromResponse(response, CookieNameEnum.REMEMBER);
  deleteCheckoutCookiesFromResponse(response);

  return response;
};

export const onRequest = requestHandler({ POST });
