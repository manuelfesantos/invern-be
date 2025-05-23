import { Cart } from "@cart-entity";
import { runBatchOperation } from "@generics-db";
import {
  getDeleteProductFromCartAction,
  getSelectCartByIdAction,
} from "@cart-db";
import { errors } from "@error-handling-utils";

export const removeProductOperation = async (
  productId: string,
  cartId: string,
): Promise<Cart> => {
  const [, cart] = await runBatchOperation(
    getDeleteProductFromCartAction(productId, cartId),
    getSelectCartByIdAction(cartId),
  );

  if (!cart) throw errors.CART_NOT_FOUND();

  return cart;
};
