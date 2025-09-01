import { getSelectOrdersByUserIdAction } from "@order-db";
import { errors } from "@error-handling-utils";
import { extendOrder } from "@extender-utils";
import type { ExtendedClientOrder } from "@order-entity";

export const getUserOrders = async (
  userId: string,
): Promise<ExtendedClientOrder[]> => {
  const orders = await getSelectOrdersByUserIdAction(userId).run();
  if (!orders) {
    throw errors.ORDERS_NOT_FOUND();
  }
  return orders.map(extendOrder);
};
