import { InsertProduct, ProductDetails } from "@product-entity";
import { runBatchOperation } from "@generics-db";
import {
  getSelectProductByIdAction,
  getUpdateProductAction,
} from "@product-db";

export const updateProductOperation = async (
  productId: string,
  changes: Partial<InsertProduct>,
): Promise<ProductDetails | undefined> => {
  const [, product] = await runBatchOperation(
    getUpdateProductAction(productId, changes),
    getSelectProductByIdAction(productId),
  );

  return product;
};
