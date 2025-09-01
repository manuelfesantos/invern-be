import type { Order } from "@order-entity";
import { selectAllOrdersOperation } from "./operations/select-all-orders";

export const getAllOrders = async (
  where?: "id" | "userId" | "paymentId" | "shippingTransactionId" | "stripeId",
  selection?: string,
): Promise<{ count: number; orders: Order[] }> => {
  return await selectAllOrdersOperation(where, selection);
};
