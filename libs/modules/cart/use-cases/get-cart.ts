import { getSelectCartByIdAction } from "@cart-db";
import { extendCart } from "@extender-utils";
import { contextStore } from "@context-utils";
import {
  Cart,
  CartDTO,
  EMPTY_CART,
  ExtendedCart,
  toCartDTO,
} from "@cart-entity";

export async function getCart(
  shouldExtend: true,
  cartId?: string,
): Promise<ExtendedCart>;
export async function getCart(
  shouldExtend: false,
  cartId?: string,
): Promise<CartDTO | Cart>;
export async function getCart(
  shouldExtend: boolean,
  cartId?: string,
): Promise<ExtendedCart | CartDTO | Cart> {
  if (!cartId) {
    cartId = contextStore.context.cartId;
  }

  if (!cartId) {
    return extendCartIfNecessary(EMPTY_CART, shouldExtend);
  }

  const cart = await getSelectCartByIdAction(cartId).run();
  if (!cart) {
    return extendCartIfNecessary(EMPTY_CART, shouldExtend);
  }
  return extendCartIfNecessary(cart, shouldExtend);
}

function extendCartIfNecessary(
  cart: Cart,
  shouldExtend: boolean,
): ExtendedCart | Cart {
  if (!shouldExtend) {
    return cart;
  }
  return extendCart(toCartDTO(cart));
}
