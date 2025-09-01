import { getAnonymousTokens } from "@jwt-utils";
import { errors } from "@error-handling-utils";
import { contextStore } from "@context-utils";
import type { ResponseContext } from "@http-entity";
import { extendCart } from "@extender-utils";
import type { ExtendedCart} from "@cart-entity";
import { EMPTY_CART, toCartDTO } from "@cart-entity";
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
