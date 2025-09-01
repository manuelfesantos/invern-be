import { successResponse } from "@response-entity";
import { getBodyFromRequest } from "@http-utils";
import { getOrder, updateOrder } from "@order-module";
import { requestHandler } from "@decorator-utils";

export const onRequestPut = requestHandler(async ({ params, request }) => {
  const body = await getBodyFromRequest(request);
  const orderId = params.id as string;
  const order = await updateOrder(orderId, body);
  return successResponse.OK("Order cancelled successfully", order);
});

export const onRequestGet = requestHandler(async ({ params }) => {
  const orderId = params.id as string;
  const order = await getOrder(orderId, false);
  return successResponse.OK("Order fetched successfully", order);
});
