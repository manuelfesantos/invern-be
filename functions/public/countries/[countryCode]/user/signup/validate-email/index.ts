import {
  deleteCheckoutCookiesFromResponse,
  deleteCookieFromResponse,
  getBodyFromRequest,
} from "@http-utils";
import { CookieNameEnum } from "@http-entity";
import { protectedSuccessResponse } from "@response-entity";
import { requestHandler } from "@decorator-utils";
import { emailSchema, requiredStringSchema } from "@global-entity";
import { z } from "zod";
import { validateEmailSecret, validateUser } from "@user-module";

const validateEmailBodySchema = z.object({
  code: requiredStringSchema("signup secret code"),
  email: emailSchema("customer email"),
});

const POST: PagesFunction = async ({ request }) => {
  const body = await getBodyFromRequest(request);

  const { code, email } = validateEmailBodySchema.parse(body);

  const secret = await validateEmailSecret(email, code);

  const { user, cart, responseContext } = await validateUser(email, secret);

  const response = protectedSuccessResponse.OK(
    "successfully signed up",
    {
      user,
      cart,
    },
    undefined,
    responseContext,
  );

  deleteCookieFromResponse(response, CookieNameEnum.CART_ID);
  deleteCheckoutCookiesFromResponse(response);

  return response;
};

export const onRequest = requestHandler({ POST });
