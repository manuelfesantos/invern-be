import { selectCartById } from "@cart-db";
import { extendCart } from "@extender-utils";
import { contextStore } from "@context-utils";
import { EMPTY_CART, ExtendedCart, toCartDTO } from "@cart-entity";
import { withTransaction } from "@db";

export const getCart = withTransaction(async (): Promise<ExtendedCart> => {
  const { cartId } = contextStore.context;
  if (!cartId) {
    return extendCart(toCartDTO(EMPTY_CART));
  }
  const cart = await selectCartById(cartId);
  if (!cart) {
    return extendCart(toCartDTO(EMPTY_CART));
  }
  return extendCart(toCartDTO(cart));
});
