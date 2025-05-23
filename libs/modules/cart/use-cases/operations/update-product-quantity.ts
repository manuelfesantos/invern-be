import { Cart } from "@cart-entity";
import { runBatchOperation } from "@generics-db";
import {
  getSelectCartByIdAction,
  getUpdateProductQuantityInCartAction,
} from "@cart-db";
import { errors } from "@error-handling-utils";

export const updateProductQuantityOperation = async (
  productId: string,
  cartId: string,
  quantity: number,
): Promise<Cart> => {
  const [, cart] = await runBatchOperation(
    getUpdateProductQuantityInCartAction(productId, cartId, quantity),
    getSelectCartByIdAction(cartId),
  );
  if (!cart) throw errors.CART_NOT_FOUND();
  return cart;
};
