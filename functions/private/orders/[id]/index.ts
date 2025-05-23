import { successResponse } from "@response-entity";
import { getBodyFromRequest } from "@http-utils";
import { getOrder, updateOrder } from "@order-module";
import { requestHandler } from "@decorator-utils";

const PUT: PagesFunction = async ({ params, request }) => {
  const body = await getBodyFromRequest(request);
  const orderId = params.id as string;
  const order = await updateOrder(orderId, body);
  return successResponse.OK("Order cancelled successfully", order);
};

const GET: PagesFunction = async ({ params }) => {
  const orderId = params.id as string;
  const order = await getOrder(orderId, false);
  return successResponse.OK("Order fetched successfully", order);
};

export const onRequest = requestHandler({ PUT, GET });
