import { contextStore } from "@context-utils";
import { insertCart } from "@cart-db";
import { logCredentials } from "@logger-utils";

export const getCartId = async (): Promise<string> => {
  let { cartId } = contextStore.context;

  if (!cartId) {
    [{ cartId }] = await insertCart({ isLoggedIn: false });
    contextStore.context.cartId = cartId;
    logCredentials(cartId);
  }

  return cartId;
};
