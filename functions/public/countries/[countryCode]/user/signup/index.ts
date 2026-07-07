import { requestHandler } from "@decorator-utils";

import {
  deleteCheckoutCookiesFromResponse,
  deleteCookieFromResponse,
  getBodyFromRequest,
} from "@http-utils";
import { signup } from "@user-module";
import { protectedSuccessResponse } from "@response-entity";
import { CookieNameEnum } from "@http-entity";

export const onRequestPost = requestHandler(async ({ request }) => {
  const body = await getBodyFromRequest(request);

  const { verificationCode } = await signup(body);

  // Locally, `signup` returns the code (no email is sent) so the verify-email
  // flow is testable without Brevo; it's undefined in every other environment.
  const response = protectedSuccessResponse.OK(
    "successfully signed up",
    verificationCode ? { verificationCode } : undefined,
  );

  deleteCookieFromResponse(response, CookieNameEnum.CART_ID);
  deleteCheckoutCookiesFromResponse(response);

  return response;
});
