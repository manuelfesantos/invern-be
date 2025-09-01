import { requestHandler } from "@decorator-utils";
import { getAllUsers } from "@user-module";
import { successResponse } from "@response-entity";
import { getQueryFromUrl } from "@http-utils";

export const onRequestGet = requestHandler(async ({ request }) => {
  const query = getQueryFromUrl(request.url);
  const page = query?.get("page");
  const pageSize = query?.get("pageSize");
  const users = await getAllUsers(page, pageSize);

  return successResponse.OK("Users fetched successfully", users);
});
