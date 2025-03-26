import { Cart } from "@cart-entity";
import { db } from "@db";
import { deleteProductFromCart } from "@cart-db";
import { errors } from "@error-handling-utils";
import { cartFromRawQueryResult, selectCartRawQuery } from "../select";

export const removeProductOperation = async (
  productId: string,
  cartId: string,
): Promise<Cart> => {
  const [, cartQueryResult] = await db(false).batch([
    deleteProductFromCart(productId, cartId),
    selectCartRawQuery(cartId),
  ]);

  if (!cartQueryResult) throw errors.CART_NOT_FOUND();

  return cartFromRawQueryResult(cartQueryResult);
};
