import { getBodyFromRequest } from "@http-utils";
import { z } from "zod";
import { emailSchema } from "@global-entity";
import { handleForgotPassword } from "@user-module";
import { requestHandler } from "@decorator-utils";
import { successResponse } from "@response-entity";

const forgotPasswordBodySchema = z.object({
  email: emailSchema("customer email"),
});

const POST: PagesFunction = async ({ request }) => {
  const body = await getBodyFromRequest(request);
  const { email } = forgotPasswordBodySchema.parse(body);

  await handleForgotPassword(email);

  return successResponse.OK("Email sent successfully");
};

export const onRequest = requestHandler({ POST });
