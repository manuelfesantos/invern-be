import { ExtendedCart, toCartDTO } from "@cart-entity";
import { getCartId } from "./utils/get-cart-id";
import { extendCart } from "@extender-utils";
import { removeProductOperation } from "./operations/remove-product";

export const removeCartItem = async (
  productId: string,
): Promise<ExtendedCart> => {
  const cartId = await getCartId();

  const cart = await removeProductOperation(productId, cartId);

  return extendCart(toCartDTO(cart));
};
