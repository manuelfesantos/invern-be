import type { Order } from "@order-entity";
import type { Paginated } from "@pagination-entity";
import { paginationQuerySchema, toPaginatedResponse } from "@pagination-entity";
import { selectAllOrdersOperation } from "./operations/select-all-orders";

export const getAllOrders = async (
  where?: "id" | "userId" | "paymentId" | "shippingTransactionId" | "stripeId",
  selection?: string,
  pagination?: unknown,
): Promise<Paginated<Order>> => {
  const { page, pageSize } = paginationQuerySchema.parse(pagination ?? {});
  const { count, orders } = await selectAllOrdersOperation(
    where,
    selection,
    page,
    pageSize,
  );
  return toPaginatedResponse(orders, { page, pageSize, total: count });
};
