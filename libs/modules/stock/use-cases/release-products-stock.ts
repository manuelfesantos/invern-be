import type { ProductIdAndQuantity } from "@product-entity";
import { getIncreaseProductsStockAction } from "@product-db";
import { stockClient } from "@r2-adapter";

/**
 * The single authorized "release stock" path: increments `products.stock` in D1
 * then writes the new levels through to the R2/KV stock stores. Every
 * checkout-cancel / session-expiry / failed-payment flow funnels through here so
 * no caller mutates stock ad-hoc (which is how the three stores drifted apart).
 */
export const releaseProductsStock = async (
  products: ProductIdAndQuantity[],
): Promise<void> => {
  if (!products.length) {
    return;
  }
  const updated = await getIncreaseProductsStockAction(products).run();
  await stockClient.updateMany(updated);
};
