import { successResponse } from "@response-entity";
import { cancelOrder } from "@order-module";
import { requestHandler } from "@decorator-utils";

export const onRequestPut = requestHandler(async ({ params }) => {
  const orderId = params.id as string;
  const order = await cancelOrder(orderId);
  return successResponse.OK("Order cancelled successfully", order);
});
