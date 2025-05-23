import { contextStore } from "@context-utils";
import { getInsertCartAction } from "@cart-db";
import { logCredentials } from "@logger-utils";
import { getRandomUUID } from "@crypto-utils";

export const getCartId = async (): Promise<string> => {
  let { cartId } = contextStore.context;

  if (!cartId) {
    cartId = getRandomUUID();
    await getInsertCartAction({ isLoggedIn: false, id: cartId }).run();
    contextStore.context.cartId = cartId;
    logCredentials(cartId);
  }

  return cartId;
};
