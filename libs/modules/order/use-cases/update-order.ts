import { getSelectOrdersByIdAction, getUpdateOrderAction } from "@order-db";
import { insertOrderSchema, Order } from "@order-entity";

export const updateOrder = async (
  orderId: string,
  body: unknown,
): Promise<Order> => {
  const orderUpdate = insertOrderSchema.parse(body);
  await getUpdateOrderAction(orderId, orderUpdate).run();
  const [updatedOrder] = await getSelectOrdersByIdAction(orderId).run();
  if (!updatedOrder) {
    throw new Error("Order not found");
  }
  return updatedOrder;
};
