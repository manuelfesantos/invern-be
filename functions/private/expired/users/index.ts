import { successResponse } from "@response-entity";
import { requestHandler } from "@decorator-utils";
import { deleteExpiredUsers } from "@user-module";

export const onRequestDelete = requestHandler(async () => {
  const responseMessage = await deleteExpiredUsers();
  return successResponse.OK(responseMessage);
});
