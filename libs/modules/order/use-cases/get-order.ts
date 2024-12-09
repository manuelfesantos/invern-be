import { getOrderByClientId } from "@order-db";
import { errors } from "@error-handling-utils";
import { successResponse } from "@response-entity";
import { HttpParams } from "@http-entity";
import { logger } from "@logger-utils";
export const getOrder = async (orderId: HttpParams): Promise<Response> => {
  const order = await getOrderByClientId(orderId as string);
  if (!order) {
    throw errors.ORDER_NOT_FOUND();
  }

  logger().addData({
    orderId: order.clientOrderId,
  });
  return successResponse.OK("success getting order", order);
};
