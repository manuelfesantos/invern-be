import type { ProductIdAndQuantity } from "@product-entity";
import { getDecreaseProductsStockAction } from "@product-db";
import { stockClient } from "@r2-adapter";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { releaseProductsStock } from "./release-products-stock";

/**
 * The single authorized "reserve stock" path: a guarded D1 decrement (the query
 * only decrements `WHEN stock >= quantity`, so it can't go negative), then a
 * write-through to the R2/KV stock stores. If the write-through fails, compensate
 * by **releasing** the decrement (restore D1 + re-mirror) so the three stores
 * never desync from a partial reservation.
 */
export const reserveProductsStock = async (
  products: ProductIdAndQuantity[],
): Promise<void> => {
  const updated = await getDecreaseProductsStockAction(products).run();

  logger().info("products reserved", {
    useCase: LoggerUseCaseEnum.RESERVE_PRODUCTS,
    data: {
      products: updated,
    },
  });
  try {
    await stockClient.updateMany(updated);
  } catch {
    await releaseProductsStock(products);
  }
};
