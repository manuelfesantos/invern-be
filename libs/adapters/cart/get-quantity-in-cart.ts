import { prepareStatement } from "@db-adapter";
import { errors } from "@error-handling-utils";

export const getQuantityInCart = async (cartId: string, productId: string) => {
  const result = await prepareStatement(
    `SELECT quantity FROM productsCarts WHERE cartId = '${cartId}' AND productId = '${productId}'`,
  ).first();
  if (!result) {
    throw errors.PRODUCT_NOT_IN_CART();
  }
  return result.quantity;
};
