import { successResponse } from "@response-entity";
import { cancelOrder } from "@order-module";
import { requestHandler } from "@decorator-utils";

const PUT: PagesFunction = async ({ params }) => {
  const orderId = params.id as string;
  const order = await cancelOrder(orderId);
  return successResponse.OK("Order cancelled successfully", order);
};

export const onRequest = requestHandler({ PUT });
