import { requestHandler } from "@decorator-utils";
import { z } from "zod";
import { emailSchema, requiredStringSchema } from "@global-entity";
import { getBodyFromRequest } from "@http-utils";
import { validateForgotPasswordCode } from "@user-module";
import { protectedSuccessResponse } from "@response-entity";

const validateCodeBodySchema = z.object({
  code: requiredStringSchema("forgot password secret code"),
  email: emailSchema("customer email"),
});

const POST: PagesFunction = async ({ request }) => {
  const body = await getBodyFromRequest(request);
  const { code, email } = validateCodeBodySchema.parse(body);
  await validateForgotPasswordCode(code, email);
  return protectedSuccessResponse.OK("Code validated successfully");
};

export const onRequest = requestHandler({ POST });
