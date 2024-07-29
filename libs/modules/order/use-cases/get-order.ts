import { getOrderByClientId } from "@order-db";
import { errors } from "@error-handling-utils";
import { successResponse } from "@response-entity";
import { HttpParams } from "@http-entity";
export const getOrder = async (orderId: HttpParams): Promise<Response> => {
  const order = await getOrderByClientId(orderId as string);
  if (!order) {
    throw errors.ORDER_NOT_FOUND();
  }
  return successResponse.OK("success getting order", order);
};
