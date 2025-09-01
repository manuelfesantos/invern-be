import { updateUserPassword } from "@user-module";
import { protectedSuccessResponse } from "@response-entity";
import { requestHandler } from "@decorator-utils";
import { getBodyFromRequest } from "@http-utils";

export const onRequestPost = requestHandler(async ({ request }) => {
  const body = await getBodyFromRequest(request);
  const user = await updateUserPassword(body);
  return protectedSuccessResponse.OK("successfully updated user", user);
});
