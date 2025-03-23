import { deleteProductFromCart } from "@cart-db";
import { CartDTO, toCartDTO } from "@cart-entity";
import { getCartId } from "./utils/get-cart-id";

export const removeCartItem = async (productId: string): Promise<CartDTO> => {
  const cartId = await getCartId();

  const cart = await deleteProductFromCart(productId, cartId);

  return toCartDTO(cart);
};
