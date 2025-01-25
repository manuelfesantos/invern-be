import { getProductById } from "@product-db";
import { errors } from "@error-handling-utils";
import { insertCart, updateCartItemQuantityInDb } from "@cart-db";
import { contextStore } from "@context-utils";

export const updateCartItemQuantity = async (
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
  }

  await updateCartItemQuantityInDb(cartId, product, quantity);

  return cartId;
};
