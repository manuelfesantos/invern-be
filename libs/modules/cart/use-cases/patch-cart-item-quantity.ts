import { getProductById } from "@product-db";
import { errors } from "@error-handling-utils";
import { insertCart, patchCartItemQuantityInDb } from "@cart-db";
import { contextStore } from "@context-utils";
import { logCredentials } from "@logger-utils";

export const patchCartItemQuantity = async (
  productId: string,
  quantity: number,
): Promise<{ id: string; newQuantity: number }> => {
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

  const newQuantity = await patchCartItemQuantityInDb(
    cartId,
    product,
    quantity,
  );

  return {
    id: cartId,
    newQuantity,
  };
};
