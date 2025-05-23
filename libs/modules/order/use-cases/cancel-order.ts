import { Order } from "@order-entity";
import { getSelectOrdersByIdAction, getUpdateOrderAction } from "@order-db";

export const cancelOrder = async (orderId: string): Promise<Order> => {
  await getUpdateOrderAction(orderId, { isCanceled: true }).run();
  const [updatedOrder] = await getSelectOrdersByIdAction(orderId).run();
  if (!updatedOrder) {
    throw new Error("Order not found");
  }
  return updatedOrder;
};
