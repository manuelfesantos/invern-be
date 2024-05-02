import { getQuantityInCart } from "./get-quantity-in-cart";
import { prepareStatement } from "@db-adapter";

export const removeFromCart = async (
  cartId: string,
  productId: string,
  quantity: number,
) => {
  const quantityInCart = (await getQuantityInCart(cartId, productId)) as number;
  if (quantity >= quantityInCart) {
    await prepareStatement(
      `DELETE FROM productsCarts WHERE cartId = '${cartId}' AND productId = '${productId}'`,
    ).run();
  } else {
    const newQuantity = quantityInCart - quantity;
    await prepareStatement(
      `UPDATE productsCarts SET quantity = ${newQuantity} WHERE cartId = '${cartId}' AND productId = '${productId}'`,
    ).run();
  }
};
