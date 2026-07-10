import { getSelectProductByIdAction, getUpdateProductAction } from "@product-db";
import { stockClient } from "@r2-adapter";
import { errors } from "@error-handling-utils";

/**
 * The dedicated stock write-through path (the one `update-product` defers to).
 * Sets a product's absolute stock across all three stores.
 *
 * D1 is written first: it is the canonical value the list/overview reads AND
 * the source `/private/stock/setup` resyncs KV+R2 from — so if the KV/R2
 * propagation fails, D1 still holds the truth and setup can recover. Writing
 * KV/R2 first would let a later D1 failure make setup revert them to a stale
 * value.
 */
export const setProductStock = async (
  productId: string,
  stock: number,
): Promise<{ id: string; stock: number }> => {
  const product = await getSelectProductByIdAction(productId).run();
  if (!product) {
    throw errors.PRODUCT_NOT_FOUND(productId);
  }

  await getUpdateProductAction(productId, { stock }).run();
  await stockClient.updateMany([{ id: productId, stock }]);

  return { id: productId, stock };
};
