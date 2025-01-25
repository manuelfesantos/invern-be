import { getCartById } from "@cart-db";
import { errors } from "@error-handling-utils";
import { extendCart } from "@price-utils";
import { contextStore } from "@context-utils";
import { ExtendedCart, toCartDTO } from "@cart-entity";

export const getCart = async (): Promise<ExtendedCart> => {
  const { cartId } = contextStore.context;
  if (!cartId) {
    throw errors.CART_NOT_FOUND();
  }
  const cart = await getCartById(cartId);
  if (!cart) {
    throw errors.CART_NOT_FOUND();
  }
  return extendCart(toCartDTO(cart));
};
