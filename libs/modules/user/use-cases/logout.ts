import { getAnonymousTokens } from "@jwt-utils";
import { errors } from "@error-handling-utils";
import { contextStore } from "@context-utils";
import { ResponseContext } from "@http-entity";
import { extendCart } from "@extender-utils";
import { EMPTY_CART, ExtendedCart, toCartDTO } from "@cart-entity";
import { logCredentials } from "@logger-utils";

interface ReturnType {
  responseContext: ResponseContext;
  cart: ExtendedCart;
}

export const logout = async (): Promise<ReturnType> => {
  const { isLoggedOut, userId, cartId } = contextStore.context;

  logCredentials(cartId, userId);

  if (isLoggedOut) {
    throw errors.UNAUTHORIZED("not logged in");
  }

  return {
    responseContext: await getAnonymousTokens(),
    cart: extendCart(toCartDTO(EMPTY_CART)),
  };
};
