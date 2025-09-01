import { getBodyFromRequest } from "@http-utils";
import { z } from "zod";
import { emailSchema } from "@global-entity";
import { submitEmail } from "@user-module";
import { requestHandler } from "@decorator-utils";
import { protectedSuccessResponse } from "@response-entity";

const forgotPasswordBodySchema = z.object({
  email: emailSchema("customer email"),
});

export const onRequestPost = requestHandler(async ({ request }) => {
  const body = await getBodyFromRequest(request);
  const { email } = forgotPasswordBodySchema.parse(body);

  await submitEmail(email);

  return protectedSuccessResponse.OK("Email sent successfully");
});
