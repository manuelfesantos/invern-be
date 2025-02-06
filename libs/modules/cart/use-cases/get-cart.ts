import { getCartById } from "@cart-db";
import { extendCart } from "@price-utils";
import { contextStore } from "@context-utils";
import { EMPTY_CART, ExtendedCart, toCartDTO } from "@cart-entity";

export const getCart = async (): Promise<ExtendedCart> => {
  const { cartId } = contextStore.context;
  if (!cartId) {
    return extendCart(toCartDTO(EMPTY_CART));
  }
  const cart = await getCartById(cartId);
  if (!cart) {
    return extendCart(toCartDTO(EMPTY_CART));
  }
  return extendCart(toCartDTO(cart));
};
