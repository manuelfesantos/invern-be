import { getBodyFromRequest } from "@http-utils";
import { protectedSuccessResponse } from "@response-entity";
import { requestHandler } from "@decorator-utils";
import { updateUserPersonalInformation } from "@user-module";

export const onRequestPost = requestHandler(async ({ request }) => {
  const body = await getBodyFromRequest(request);
  const user = await updateUserPersonalInformation(body);

  return protectedSuccessResponse.OK("successfully updated user", user);
});
