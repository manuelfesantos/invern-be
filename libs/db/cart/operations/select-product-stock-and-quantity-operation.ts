import { db } from "@db";
import { errors } from "@error-handling-utils";
import { selectProductStockById } from "@product-db";
import { selectProductQuantityInCart } from "@cart-db";

const NO_QUANTITY = 0;

export const selectProductStockAndQuantityOperation = async (
  productId: string,
  cartId: string,
): Promise<{ stock: number; quantity: number }> => {
  const [productStock, productQuantityInCart] = await db(false).batch([
    selectProductStockById(productId),
    selectProductQuantityInCart(productId, cartId),
  ]);

  if (productStock === undefined) {
    throw errors.PRODUCT_NOT_FOUND();
  }

  return {
    stock: productStock.stock,
    quantity: productQuantityInCart?.quantity || NO_QUANTITY,
  };
};
