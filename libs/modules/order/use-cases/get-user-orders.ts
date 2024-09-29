import { getOrdersByUserId } from "@order-db";
import {
  ProtectedModuleFunction,
  protectedSuccessResponse,
} from "@response-entity";
import { errors } from "@error-handling-utils";

export const getUserOrders: ProtectedModuleFunction = async (
  tokens,
  remember,
  userId: string,
): Promise<Response> => {
  const orders = await getOrdersByUserId(userId);
  if (!orders) {
    throw errors.ORDERS_NOT_FOUND();
  }
  return protectedSuccessResponse.OK(
    tokens,
    "success getting orders by user id",
    { orders },
    remember,
  );
};
