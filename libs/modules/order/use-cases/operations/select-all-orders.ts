import { Order } from "@order-entity";
import { runBatchOperationWithCount } from "@generics-db";
import { ordersTable } from "@schema";
import { getSelectOrdersAction } from "@order-db";

export const selectAllOrdersOperation = async (
  where?: "id" | "userId" | "paymentId" | "shippingTransactionId" | "stripeId",
  selection?: string,
  page?: number,
  pageSize?: number,
): Promise<{ count: number; orders: Order[] }> => {
  const [count, orders] = await runBatchOperationWithCount(
    ordersTable,
    getSelectOrdersAction(where, selection, page, pageSize),
  );
  return { count, orders: await orders };
};
