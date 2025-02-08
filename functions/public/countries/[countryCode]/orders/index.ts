import { errorResponse, successResponse } from "@response-entity";
import { getUserOrders } from "@order-module";
import { requestHandler } from "@decorator-utils";
import { contextStore } from "@context-utils";
import { PagesFunction } from "@cloudflare/workers-types";

const GET: PagesFunction = async () => {
  const { userId } = contextStore.context;

  if (!userId) {
    return errorResponse.UNAUTHORIZED();
  }

  const orders = getUserOrders(userId);

  return successResponse.OK("Successfully got user orders", orders);
};

export const onRequest = requestHandler({ GET });
