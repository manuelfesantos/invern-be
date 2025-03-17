import { getProductById } from "@product-db";
import { errors } from "@error-handling-utils";
import {
  insertCart,
  patchCartItemQuantityInDb,
  updateCartLastModifiedDate,
} from "@cart-db";
import { contextStore } from "@context-utils";
import { logCredentials } from "@logger-utils";

export const patchCartItemQuantity = async (
  productId: string,
  quantity: number,
): Promise<string> => {
  const product = await getProductById(productId);
  if (!product) {
    throw errors.PRODUCT_NOT_FOUND();
  }

  let { cartId } = contextStore.context;

  if (!cartId) {
    [{ cartId }] = await insertCart({ isLoggedIn: false });
    contextStore.context.cartId = cartId;
    logCredentials(cartId);
  }

  await patchCartItemQuantityInDb(cartId, product, quantity);

  await updateCartLastModifiedDate(cartId);

  return cartId;
};
