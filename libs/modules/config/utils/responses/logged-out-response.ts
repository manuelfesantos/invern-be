import { protectedSuccessResponse } from "@response-entity";
import { getAnonymousTokens } from "@jwt-utils";
import {
  deleteCookieFromResponse,
  getCartIdFromHeaders,
  setCartIdCookieInResponse,
} from "@http-utils";
import { selectCartById } from "@cart-db";
import { Cart, EMPTY_CART, toCartDTO } from "@cart-entity";
import { CookieNameEnum } from "@http-entity";
import { extendCart } from "@price-utils";

export const loggedOutResponse = async (
  headers: Headers,
): Promise<Response> => {
  const { accessToken, refreshToken } = await getAnonymousTokens();
  let cart: Cart = EMPTY_CART;

  const cartId = getCartIdFromHeaders(headers);
  if (cartId) {
    cart = (await selectCartById(cartId)) || cart;
  }

  const response = protectedSuccessResponse.OK(
    "success getting logged out config",
    {
      cart: extendCart(toCartDTO(cart)),
    },
    undefined,
    { refreshToken, accessToken },
  );

  if (cartId) {
    if (cart.id) {
      setCartIdCookieInResponse(response, cartId);
    } else {
      deleteCookieFromResponse(response, CookieNameEnum.CART_ID);
    }
  }

  deleteCookieFromResponse(response, CookieNameEnum.REMEMBER);
  return response;
};
