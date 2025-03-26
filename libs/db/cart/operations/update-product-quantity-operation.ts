import { updateProductQuantityInCart } from "@cart-db";
import { db } from "@db";
import { errors } from "@error-handling-utils";
import { Cart } from "@cart-entity";
import { cartFromRawQueryResult, selectCartRawQuery } from "../select";

export const updateProductQuantityOperation = async (
  productId: string,
  cartId: string,
  quantity: number,
): Promise<Cart> => {
  const [, cartQueryResult] = await db(false).batch([
    updateProductQuantityInCart(productId, cartId, quantity),
    selectCartRawQuery(cartId),
  ]);
  if (!cartQueryResult) throw errors.CART_NOT_FOUND();
  return cartFromRawQueryResult(cartQueryResult);
};
