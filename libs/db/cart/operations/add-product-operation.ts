import { insertProductInCart } from "@cart-db";
import { db } from "@db";
import { Cart } from "@cart-entity";
import { errors } from "@error-handling-utils";
import { cartFromRawQueryResult, selectCartRawQuery } from "../select";

export const addProductOperation = async (
  productId: string,
  cartId: string,
  quantity: number,
): Promise<Cart> => {
  const [, cartQueryResult] = await db(false).batch([
    insertProductInCart(productId, cartId, quantity),
    selectCartRawQuery(cartId),
  ]);

  if (!cartQueryResult) throw errors.CART_NOT_FOUND();

  return cartFromRawQueryResult(cartQueryResult);
};
