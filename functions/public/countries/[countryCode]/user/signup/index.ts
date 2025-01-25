import { requestHandler } from "@decorator-utils";
import { PagesFunction } from "@cloudflare/workers-types";
import { deleteCookieFromResponse, getBodyFromRequest } from "@http-utils";
import { signup } from "@user-module";
import { protectedSuccessResponse } from "@response-entity";
import { CookieNameEnum } from "@http-entity";

const POST: PagesFunction = async ({ request }) => {
  const body = getBodyFromRequest(request);

  const { user, responseContext } = await signup(body);

  const response = protectedSuccessResponse.OK(
    "successfully signed up",
    user,
    undefined,
    responseContext,
  );

  deleteCookieFromResponse(response, CookieNameEnum.CART_ID);

  return response;
};

export const onRequest = requestHandler({ POST });
