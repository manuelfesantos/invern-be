import { deleteUser, getUser } from "@user-module";
import { protectedSuccessResponse, successResponse } from "@response-entity";
import { requestHandler } from "@decorator-utils";
import { PagesFunction } from "@cloudflare/workers-types";
import { deleteCheckoutCookiesFromResponse } from "@http-utils";

const GET: PagesFunction = async () => {
  const user = await getUser();
  return successResponse.OK("Successfully got user", user);
};

const DELETE: PagesFunction = async () => {
  const { responseContext } = await deleteUser();
  const response = protectedSuccessResponse.OK(
    "success deleting user",
    undefined,
    undefined,
    responseContext,
  );
  deleteCheckoutCookiesFromResponse(response);
  return response;
};

export const onRequest = requestHandler({ GET, DELETE });
