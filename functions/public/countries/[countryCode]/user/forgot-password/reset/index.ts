import { protectedSuccessResponse } from "@response-entity";
import * as z from "zod";
import { getBodyFromRequest } from "@http-utils";
import { resetForgottenPassword } from "@user-module";
import { requestHandler } from "@decorator-utils";

const resetForgottenPasswordBodySchema = z.object({
  code: z.string().nonempty(),
  email: z.email(),
  password: z.string().nonempty(),
});

export const onRequestPost = requestHandler(async ({ request }) => {
  const body = await getBodyFromRequest(request);
  const { code, email, password } =
    resetForgottenPasswordBodySchema.parse(body);
  await resetForgottenPassword(password, code, email);
  return protectedSuccessResponse.OK("Password reset successfully");
});
