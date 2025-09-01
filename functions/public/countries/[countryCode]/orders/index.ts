import { protectedSuccessResponse } from "@response-entity";
import { getUserOrders } from "@order-module";
import { requestHandler } from "@decorator-utils";
import { contextStore } from "@context-utils";

import { errors } from "@error-handling-utils";

export const onRequestGet = requestHandler(async () => {
  const { userId } = contextStore.context;

  if (!userId) {
    throw errors.UNAUTHORIZED();
  }

  const orders = await getUserOrders(userId);

  return protectedSuccessResponse.OK("Successfully got user orders", {
    orders,
  });
});
