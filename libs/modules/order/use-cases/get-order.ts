import { selectOrderById } from "@order-db";
import { errors } from "@error-handling-utils";
import { HttpParams } from "@http-entity";
import { logger } from "@logger-utils";
import { extendOrder } from "@extender-utils";
import { clientOrderSchema, ExtendedClientOrder } from "@order-entity";
export const getOrder = async (
  orderId: HttpParams,
): Promise<ExtendedClientOrder> => {
  const order = await selectOrderById(orderId as string);
  if (!order) {
    throw errors.ORDER_NOT_FOUND();
  }

  logger().addRedactedData({
    orderId: order.id,
  });

  return extendOrder(clientOrderSchema.parse(order));
};
