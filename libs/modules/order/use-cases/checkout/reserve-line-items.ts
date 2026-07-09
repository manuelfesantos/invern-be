import {
  getDecreaseProductsStockAction,
  getIncreaseProductsStockAction,
} from "@product-db";
import type { LineItem } from "@product-entity";
import { stockClient } from "@r2-adapter";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";

/**
 * Reserves stock for the checkout line items: decrement `products.stock` in D1,
 * then mirror the new levels to the R2/KV stock stores. If the stock-store write
 * fails, **compensate** by restoring the D1 decrement (and re-mirroring), so the
 * three stores never desync from a partial reservation.
 */
export const reserveLineItems = async (
  lineItems: LineItem[],
): Promise<void> => {
  const updatedLineItems =
    await getDecreaseProductsStockAction(lineItems).run();

  logger().info("products reserved", {
    useCase: LoggerUseCaseEnum.RESERVE_PRODUCTS,
    data: {
      products: updatedLineItems,
    },
  });
  try {
    await stockClient.updateMany(updatedLineItems);
  } catch {
    const updatedProducts =
      await getIncreaseProductsStockAction(lineItems).run();

    await stockClient.updateMany(updatedProducts);
  }
};
