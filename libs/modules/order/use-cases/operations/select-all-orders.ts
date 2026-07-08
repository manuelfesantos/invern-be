import type { SQL } from "drizzle-orm";
import type { Order } from "@order-entity";
import { runBatchOperationWithCount } from "@generics-db";
import { ordersTable } from "@schema";
import { getSelectOrdersAction } from "@order-db";

export const selectAllOrdersOperation = async (
  page: number,
  pageSize: number,
  where?: SQL,
  orderBy?: SQL[],
): Promise<{ count: number; orders: Order[] }> => {
  const [count, orders] = await runBatchOperationWithCount(
    ordersTable,
    getSelectOrdersAction(page, pageSize, where, orderBy),
    where,
  );
  return { count, orders: await orders };
};
