import type { Cart } from "@cart-entity";
import { runBatchOperationWithCount } from "@generics-db";
import { cartsTable } from "@schema";
import { getSelectAllCartsAction } from "@cart-db";

export const selectAllCartsOperation = async (
  page: number,
  pageSize: number,
): Promise<{ count: number; carts: Cart[] }> => {
  const [count, carts] = await runBatchOperationWithCount(
    cartsTable,
    getSelectAllCartsAction(page, pageSize),
  );
  return {
    count,
    carts,
  };
};
