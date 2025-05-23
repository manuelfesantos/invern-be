import { runBatchOperation } from "@generics-db";
import { getSelectProductStockByIdAction } from "@product-db";
import { getSelectProductQuantityInCartAction } from "@cart-db";
import { errors } from "@error-handling-utils";

const NO_QUANTITY = 0;

export const selectProductStockAndQuantityOperation = async (
  productId: string,
  cartId: string,
): Promise<{ stock: number; quantity: number }> => {
  const [productStock, productQuantityInCart] = await runBatchOperation(
    getSelectProductStockByIdAction(productId),
    getSelectProductQuantityInCartAction(productId, cartId),
  );

  if (productStock === undefined) {
    throw errors.PRODUCT_NOT_FOUND();
  }

  return {
    stock: productStock,
    quantity: productQuantityInCart || NO_QUANTITY,
  };
};
