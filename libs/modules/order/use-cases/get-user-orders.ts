import { getOrdersByUserId } from "@order-db";
import { successResponse } from "@response-entity";
import { errors } from "@error-handling-utils";

const EMPTY_ORDERS = 0;

export const getUserOrders = async (userId: string): Promise<Response> => {
  const orders = await getOrdersByUserId(userId);
  if (!orders || orders.length === EMPTY_ORDERS) {
    throw errors.ORDERS_NOT_FOUND();
  }
  return successResponse.OK("success getting orders by user id", orders);
};
