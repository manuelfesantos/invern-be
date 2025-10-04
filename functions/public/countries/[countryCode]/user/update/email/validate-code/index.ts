import { validateUpdateEmailCode } from "@user-module";
import { protectedSuccessResponse } from "@response-entity";
import { requestHandler } from "@decorator-utils";
import { getBodyFromRequest } from "@http-utils";

export const onRequestPost = requestHandler(async ({ request }) => {
  const body = await getBodyFromRequest(request);
  const user = await validateUpdateEmailCode(body);

  return protectedSuccessResponse.OK("successfully validated email code", user);
});
