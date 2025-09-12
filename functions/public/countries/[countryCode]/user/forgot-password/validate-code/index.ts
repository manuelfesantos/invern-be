import { requestHandler } from "@decorator-utils";
import * as z from "zod";
import { getBodyFromRequest } from "@http-utils";
import { protectedSuccessResponse } from "@response-entity";
import { validateCode } from "@user-module";

const validateCodeBodySchema = z.object({
  code: z.string().nonempty(),
  email: z.email(),
});

export const onRequestPost = requestHandler(async ({ request }) => {
  const body = await getBodyFromRequest(request);
  const { code, email } = validateCodeBodySchema.parse(body);
  await validateCode(code, email);

  return protectedSuccessResponse.OK("Code validated successfully");
});
