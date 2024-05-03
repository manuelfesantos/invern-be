import { prepareStatement } from "@db-adapter";
import { errors } from "@error-handling-utils";

interface Quantity {
  quantity: number;
}

export const getQuantityInCart = async (
  cartId: string,
  productId: string,
): Promise<number> => {
  const result = await prepareStatement(
    `SELECT quantity FROM productsCarts WHERE cartId = '${cartId}' AND productId = '${productId}'`,
  ).first<Quantity>();
  if (!result) {
    throw errors.PRODUCT_NOT_IN_CART();
  }
  return result.quantity;
};
