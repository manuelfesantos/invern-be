import { errors } from "@error-handling-utils";
import { selectProductStockById } from "@product-db";

export const getProductStock = async (productId: string): Promise<number> => {
  const productStock = await selectProductStockById(productId);

  if (productStock === undefined) {
    throw errors.PRODUCT_NOT_FOUND();
  }

  return productStock;
};
