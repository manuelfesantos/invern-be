import {
  getDecreaseProductsStockAction,
  getIncreaseProductsStockAction,
  getSelectProductByIdAction,
} from "@product-db";
import { stockClient } from "@r2-adapter";
import { errors } from "@error-handling-utils";

/**
 * Admin stock adjustment by a signed DELTA — never an absolute set.
 *
 * Absolute sets race with Stripe checkout reservations: while a checkout holds
 * stock, an absolute write would clobber the reservation, and the later release
 * would add it back on top → over-count. A delta composes: it applies on top of
 * whatever the reservation left. This reuses the same atomic-SQL increment /
 * guarded-decrement the reserve/release paths use (so it can't drive stock
 * negative), then mirrors the result to KV+R2.
 */
export const adjustProductStock = async (
  productId: string,
  delta: number,
): Promise<{ id: string; stock: number }> => {
  const product = await getSelectProductByIdAction(productId).run();
  if (!product) {
    throw errors.PRODUCT_NOT_FOUND(productId);
  }
  const currentStock = product.stock ?? 0;
  if (delta === 0) {
    return { id: productId, stock: currentStock };
  }

  let updated: { id: string; stock: number };
  if (delta > 0) {
    [updated] = await getIncreaseProductsStockAction([
      { id: productId, quantity: delta },
    ]).run();
  } else {
    const removeQty = -delta;
    // Fast, clear rejection; the guarded SQL below is the atomic safety net.
    if (currentStock < removeQty) {
      throw errors.PRODUCT_OUT_OF_STOCK(currentStock);
    }
    [updated] = await getDecreaseProductsStockAction([
      { id: productId, quantity: removeQty },
    ]).run();
  }

  await stockClient.updateMany([updated]);
  return updated;
};
