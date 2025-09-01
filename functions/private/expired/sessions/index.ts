import { deleteExpiredCheckoutSessions } from "@order-module";
import { requestHandler } from "@decorator-utils";
import { successResponse } from "@response-entity";

export const onRequestDelete = requestHandler(async () => {
  const responseMessage = await deleteExpiredCheckoutSessions();
  return successResponse.OK(responseMessage);
});
