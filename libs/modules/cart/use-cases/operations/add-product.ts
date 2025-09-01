import type { Cart } from "@cart-entity";
import { runBatchOperation } from "@generics-db";
import {
  getInsertProductInCartAction,
  getSelectCartByIdAction,
} from "@cart-db";
import { errors } from "@error-handling-utils";

export const addProductOperation = async (
  productId: string,
  cartId: string,
  quantity: number,
): Promise<Cart> => {
  const [, cart] = await runBatchOperation(
    getInsertProductInCartAction(productId, cartId, quantity),
    getSelectCartByIdAction(cartId),
  );

  if (!cart) throw errors.CART_NOT_FOUND();

  return cart;
};
