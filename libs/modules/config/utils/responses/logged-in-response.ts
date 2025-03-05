import { getUserById } from "@user-db";
import { protectedSuccessResponse } from "@response-entity";
import { getLoggedInToken } from "@jwt-utils";
import { loggedOutResponse } from "./logged-out-response";
import { userDTOSchema } from "@user-entity";
import { deleteCookieFromResponse, getCartIdFromHeaders } from "@http-utils";
import { EMPTY_CART, toCartDTO } from "@cart-entity";
import { CookieNameEnum } from "@http-entity";
import { logCredentials } from "@logger-utils";
import { extendCart } from "@price-utils";

export const loggedInResponse = async (
  headers: Headers,
  userId: string,
  refreshToken: string,
  cartId?: string,
  remember?: boolean,
): Promise<Response> => {
  logCredentials(cartId, userId);

  const user = await getUserById(userId);

  if (!user) {
    return loggedOutResponse(headers);
  }

  const accessToken = await getLoggedInToken(userId, cartId);

  const cartIdFromCookie = getCartIdFromHeaders(headers);

  const response = protectedSuccessResponse.OK(
    "success getting logged in config",
    {
      user: userDTOSchema.parse(user),
      cart: extendCart(toCartDTO(user.cart || EMPTY_CART)),
    },
    undefined,
    { refreshToken, accessToken, remember },
  );

  if (cartIdFromCookie) {
    deleteCookieFromResponse(response, CookieNameEnum.CART_ID);
  }

  return response;
};
