import { successResponse } from "@response-entity";
import { getUserOrders } from "@order-module";
import { requestHandler } from "@decorator-utils";
import { contextStore } from "@context-utils";
import { PagesFunction } from "@cloudflare/workers-types";
import { errors } from "@error-handling-utils";

const GET: PagesFunction = async () => {
  const { userId } = contextStore.context;

  if (!userId) {
    throw errors.UNAUTHORIZED();
  }

  const orders = getUserOrders(userId);

  return successResponse.OK("Successfully got user orders", orders);
};

export const onRequest = requestHandler({ GET });
