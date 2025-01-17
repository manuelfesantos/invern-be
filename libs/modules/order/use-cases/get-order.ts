import { getOrderById } from "@order-db";
import { errors } from "@error-handling-utils";
import { successResponse } from "@response-entity";
import { HttpParams } from "@http-entity";
import { logger } from "@logger-utils";
import { Country } from "@country-entity";
import { extendOrder } from "@price-utils";
export const getOrder = async (
  orderId: HttpParams,
  country?: Country,
): Promise<Response> => {
  const order = await getOrderById(orderId as string);
  if (!order) {
    throw errors.ORDER_NOT_FOUND();
  }

  logger().addData({
    orderId: order.id,
  });

  if (country) {
    return successResponse.OK(
      "success geting order",
      extendOrder(order, country),
    );
  }

  return successResponse.OK("success getting order", order);
};
