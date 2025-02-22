import { deleteUser, getUser, updateUser } from "@user-module";
import { protectedSuccessResponse, successResponse } from "@response-entity";
import { requestHandler } from "@decorator-utils";
import { PagesFunction } from "@cloudflare/workers-types";
import {
  deleteCheckoutCookiesFromResponse,
  getBodyFromRequest,
} from "@http-utils";

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

const PUT: PagesFunction = async ({ request }) => {
  const body = await getBodyFromRequest(request);
  const user = await updateUser(body);

  return protectedSuccessResponse.OK("successfully updated user", user);
};

export const onRequest = requestHandler({ GET, PUT, DELETE });
