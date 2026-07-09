import type { Order } from "@order-entity";
import { getSelectOrdersByIdAction, getUpdateOrderAction } from "@order-db";
import { getUpdateShippingTransactionAction } from "@shipping-transaction-db";
import { ShippingTransactionStatusEnum } from "@shipping-transaction-entity";
import { errors } from "@error-handling-utils";

export const cancelOrder = async (orderId: string): Promise<Order> => {
  const [order] = await getSelectOrdersByIdAction(orderId).run();
  if (!order) {
    throw errors.ORDER_NOT_FOUND();
  }

  await getUpdateOrderAction(orderId, { isCanceled: true }).run();

  // Keep fulfillment coherent: a canceled order's shipping transaction is
  // canceled too — unless it was already delivered (can't un-deliver).
  if (
    order.shippingTransaction.status !== ShippingTransactionStatusEnum.delivered
  ) {
    await getUpdateShippingTransactionAction(order.shippingTransaction.id, {
      status: ShippingTransactionStatusEnum.canceled,
    }).run();
  }

  const [updatedOrder] = await getSelectOrdersByIdAction(orderId).run();
  if (!updatedOrder) {
    throw errors.ORDER_NOT_FOUND();
  }
  return updatedOrder;
};
