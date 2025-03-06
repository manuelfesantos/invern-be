import { selectOrdersByUserId } from "@order-db";
import { errors } from "@error-handling-utils";
import { extendOrder } from "@price-utils";
import { ExtendedClientOrder } from "@order-entity";

export const getUserOrders = async (
  userId: string,
): Promise<ExtendedClientOrder[]> => {
  const orders = await selectOrdersByUserId(userId);
  if (!orders) {
    throw errors.ORDERS_NOT_FOUND();
  }
  return orders.map(extendOrder);
};
