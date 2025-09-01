import { requestHandler } from "@decorator-utils";
import { successResponse } from "@response-entity";
import { deleteExpiredCarts } from "@cart-module";

export const onRequestDelete = requestHandler(async () => {
  const responseMessage = await deleteExpiredCarts();
  return successResponse.OK(responseMessage);
});
