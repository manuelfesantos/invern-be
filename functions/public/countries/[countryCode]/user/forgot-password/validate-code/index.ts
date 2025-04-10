import { requestHandler } from "@decorator-utils";
import { z } from "zod";
import { emailSchema, requiredStringSchema } from "@global-entity";
import { getBodyFromRequest } from "@http-utils";
import { protectedSuccessResponse } from "@response-entity";
import { validateCode } from "@user-module";

const validateCodeBodySchema = z.object({
  code: requiredStringSchema("forgot password secret code"),
  email: emailSchema("customer email"),
});

const POST: PagesFunction = async ({ request }) => {
  const body = await getBodyFromRequest(request);
  const { code, email } = validateCodeBodySchema.parse(body);
  await validateCode(code, email);

  return protectedSuccessResponse.OK("Code validated successfully");
};

export const onRequest = requestHandler({ POST });
