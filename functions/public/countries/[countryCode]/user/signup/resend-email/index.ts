import { getBodyFromRequest } from "@http-utils";
import { emailSchema } from "@global-entity";
import { z } from "zod";
import { protectedSuccessResponse } from "@response-entity";
import { requestHandler } from "@decorator-utils";
import { resendEmail } from "@user-module";

const resendEmailBodySchema = z.object({
  email: emailSchema("customer email"),
});

const POST: PagesFunction = async ({ request }) => {
  const body = await getBodyFromRequest(request);

  const { email } = resendEmailBodySchema.parse(body);

  await resendEmail(email);

  return protectedSuccessResponse.OK("successfully signed up");
};

export const onRequest = requestHandler({ POST });
