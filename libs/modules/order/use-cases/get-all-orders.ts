import type { Order } from "@order-entity";
import type { Paginated } from "@pagination-entity";
import { parseListQuery, toPaginatedResponse } from "@pagination-entity";
import { boolFilter, buildOrderBy, buildWhere, eqFilter } from "@generics-db";
import { ordersTable } from "@schema";
import { selectAllOrdersOperation } from "./operations/select-all-orders";

/** Admin-list sortable fields → their columns. */
const ORDER_SORT_MAP = {
  createdAt: ordersTable.createdAt,
  lastModifiedAt: ordersTable.lastModifiedAt,
  isCanceled: ordersTable.isCanceled,
};

/**
 * Admin-list filter keys → bound conditions. The legacy exact-match id filters
 * (userId/paymentId/shippingTransactionId/stripeId) are folded into the same
 * contract, now AND-combinable and joined by `isCanceled`.
 */
const ORDER_FILTER_MAP = {
  userId: eqFilter(ordersTable.userId),
  paymentId: eqFilter(ordersTable.paymentId),
  shippingTransactionId: eqFilter(ordersTable.shippingTransactionId),
  stripeId: eqFilter(ordersTable.stripeId),
  isCanceled: boolFilter(ordersTable.isCanceled),
};

export const getAllOrders = async (
  query?: unknown,
): Promise<Paginated<Order>> => {
  const { page, pageSize, sortBy, sortOrder } = parseListQuery(
    ["createdAt", "lastModifiedAt", "isCanceled"],
    query,
  );
  const filters = (query ?? {}) as Record<string, string | undefined>;

  const where = buildWhere(ORDER_FILTER_MAP, filters);
  const orderBy = buildOrderBy(ORDER_SORT_MAP, sortBy, sortOrder);

  const { count, orders } = await selectAllOrdersOperation(
    page,
    pageSize,
    where,
    orderBy,
  );
  return toPaginatedResponse(orders, { page, pageSize, total: count });
};
