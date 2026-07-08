import { getDeleteProductAction } from "@product-db";
import { stockClient } from "@r2-adapter";

export const deleteProduct = async (id: string): Promise<void> => {
  await getDeleteProductAction(id).run();
  // Clear the product's stock from KV + R2 too, so no stale entries leak.
  await stockClient.delete(id);
};
