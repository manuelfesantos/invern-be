import { requestHandler } from "@decorator-utils";
import { PagesFunction } from "@cloudflare/workers-types";
import {
  deleteCheckoutCookiesFromResponse,
  deleteCookieFromResponse,
  getBodyFromRequest,
} from "@http-utils";
import { signup } from "@user-module";
import { protectedSuccessResponse } from "@response-entity";
import { CookieNameEnum } from "@http-entity";

const POST: PagesFunction = async ({ request }) => {
  const body = await getBodyFromRequest(request);

  const { user, responseContext, cart } = await signup(body);

  const response = protectedSuccessResponse.OK(
    "successfully signed up",
    { user, cart },
    undefined,
    responseContext,
  );

  deleteCookieFromResponse(response, CookieNameEnum.CART_ID);
  deleteCheckoutCookiesFromResponse(response);

  return response;
};

export const onRequest = requestHandler({ POST });
