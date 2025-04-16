import { validateUpdateEmailCode } from "@user-module";
import { protectedSuccessResponse } from "@response-entity";
import { requestHandler } from "@decorator-utils";
import { getBodyFromRequest } from "@http-utils";

const POST: PagesFunction = async ({ request }) => {
  const body = await getBodyFromRequest(request);
  await validateUpdateEmailCode(body);
  return protectedSuccessResponse.OK("successfully validated email code");
};

export const onRequest = requestHandler({ POST });
