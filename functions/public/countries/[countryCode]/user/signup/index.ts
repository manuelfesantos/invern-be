import { requestHandler } from "@decorator-utils";

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

  await signup(body);

  const response = protectedSuccessResponse.OK("successfully signed up");

  deleteCookieFromResponse(response, CookieNameEnum.CART_ID);
  deleteCheckoutCookiesFromResponse(response);

  return response;
};

export const onRequest = requestHandler({ POST });
