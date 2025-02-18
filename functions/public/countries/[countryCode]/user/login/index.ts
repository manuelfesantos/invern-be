import { requestHandler } from "@decorator-utils";
import { PagesFunction } from "@cloudflare/workers-types";
import { login } from "@user-module";
import { protectedSuccessResponse } from "@response-entity";
import { deleteCookieFromResponse, getBodyFromRequest } from "@http-utils";
import { CookieNameEnum } from "@http-entity";

const POST: PagesFunction = async ({ request }) => {
  const body = await getBodyFromRequest(request);

  const { user, responseContext, cart } = await login(body);
  const response = protectedSuccessResponse.OK(
    "successfully logged in",
    { user, cart },
    undefined,
    responseContext,
  );

  deleteCookieFromResponse(response, CookieNameEnum.CART_ID);

  return response;
};

export const onRequest = requestHandler({ POST });
