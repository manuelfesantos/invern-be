import type { ExtendedCart} from "@cart-entity";
import { toCartDTO } from "@cart-entity";
import { getCartId } from "./utils/get-cart-id";
import { extendCart } from "@extender-utils";
import { removeProductOperation } from "./operations/remove-product";
import { errors } from "@error-handling-utils";

export const removeCartItem = async (
  productId: string,
): Promise<ExtendedCart> => {
  const cartId = await getCartId();

  const [success, cart] = await removeProductOperation(productId, cartId);
  if (!success) throw errors.PRODUCT_NOT_FOUND();

  return extendCart(toCartDTO(cart));
};
