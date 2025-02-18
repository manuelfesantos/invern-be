import { getAnonymousTokens } from "@jwt-utils";
import { errors } from "@error-handling-utils";
import { contextStore } from "@context-utils";
import { ResponseContext } from "@http-entity";
import { extendCart } from "@price-utils";
import { EMPTY_CART, ExtendedCart, toCartDTO } from "@cart-entity";

interface ReturnType {
  responseContext: ResponseContext;
  cart: ExtendedCart;
}

export const logout = async (): Promise<ReturnType> => {
  const { isLoggedOut } = contextStore.context;

  if (isLoggedOut) {
    throw errors.UNAUTHORIZED("not logged in");
  }

  return {
    responseContext: await getAnonymousTokens(),
    cart: extendCart(toCartDTO(EMPTY_CART)),
  };
};
