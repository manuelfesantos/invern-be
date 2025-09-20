import type { Cart } from "@cart-entity";
import { runBatchOperation } from "@generics-db";
import {
  getDeleteProductFromCartAction,
  getSelectCartByIdAction,
} from "@cart-db";
import { errors } from "@error-handling-utils";

const ZERO = 0;

export const removeProductOperation = async (
  productId: string,
  cartId: string,
): Promise<[boolean, Cart]> => {
  const [resultSet, cart] = await runBatchOperation(
    getDeleteProductFromCartAction(productId, cartId),
    getSelectCartByIdAction(cartId),
  );

  if (!cart) throw errors.CART_NOT_FOUND();

  return [resultSet.meta.rows_written > ZERO, cart];
};
