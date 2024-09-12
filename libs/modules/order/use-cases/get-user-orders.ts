import { getOrdersByUserId } from "@order-db";
import {
  ProtectedModuleFunction,
  protectedSuccessResponse,
} from "@response-entity";
import { errors } from "@error-handling-utils";

const EMPTY_ORDERS = 0;

export const getUserOrders: ProtectedModuleFunction = async (
  tokens,
  remember,
  userId: string,
): Promise<Response> => {
  const orders = await getOrdersByUserId(userId);
  if (!orders || orders.length === EMPTY_ORDERS) {
    throw errors.ORDERS_NOT_FOUND();
  }
  return protectedSuccessResponse.OK(
    tokens,
    "success getting orders by user id",
    { orders },
    remember,
  );
};
