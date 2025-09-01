import { protectedSuccessResponse } from "@response-entity";
import { z } from "zod";
import { emailSchema, requiredStringSchema } from "@global-entity";
import { getBodyFromRequest } from "@http-utils";
import { resetForgottenPassword } from "@user-module";
import { requestHandler } from "@decorator-utils";

const resetForgottenPasswordBodySchema = z.object({
  code: requiredStringSchema("forgot password secret code"),
  email: emailSchema("customer email"),
  password: requiredStringSchema("password"),
});

export const onRequestPost = requestHandler(async ({ request }) => {
  const body = await getBodyFromRequest(request);
  const { code, email, password } =
    resetForgottenPasswordBodySchema.parse(body);
  await resetForgottenPassword(password, code, email);
  return protectedSuccessResponse.OK("Password reset successfully");
});
