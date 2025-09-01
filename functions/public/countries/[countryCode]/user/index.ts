import { deleteUser, getUser } from "@user-module";
import { protectedSuccessResponse, successResponse } from "@response-entity";
import { requestHandler } from "@decorator-utils";

import { deleteCheckoutCookiesFromResponse } from "@http-utils";

export const onRequestGet = requestHandler(async () => {
  const user = await getUser();
  return successResponse.OK("Successfully got user", user);
});

export const onRequestDelete = requestHandler(async () => {
  const { responseContext } = await deleteUser();
  const response = protectedSuccessResponse.OK(
    "success deleting user",
    undefined,
    undefined,
    responseContext,
  );
  deleteCheckoutCookiesFromResponse(response);
  return response;
});
