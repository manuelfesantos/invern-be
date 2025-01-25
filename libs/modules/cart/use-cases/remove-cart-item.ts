import { getProductById } from "@product-db";
import { errors } from "@error-handling-utils";
import { insertCart, removeCartItemInDb } from "@cart-db";
import { contextStore } from "@context-utils";

export const removeCartItem = async (productId: string): Promise<string> => {
  const product = await getProductById(productId);

  if (!product) {
    throw errors.PRODUCT_NOT_FOUND;
  }

  let { cartId } = contextStore.context;

  if (!cartId) {
    [{ cartId }] = await insertCart({ isLoggedIn: false });
    contextStore.context.cartId = cartId;
  }

  await removeCartItemInDb(cartId, productId);

  return cartId;
};
