import { successResponse } from "@response-entity";
import { requestHandler } from "@decorator-utils";
import { deleteExpiredUsers } from "@user-module";

const DELETE: PagesFunction = async () => {
  const responseMessage = await deleteExpiredUsers();
  return successResponse.OK(responseMessage);
};

export const onRequest = requestHandler({ DELETE });
