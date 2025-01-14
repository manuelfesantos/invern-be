import { HttpMethodEnum } from "@http-entity";
import { errorResponse, generateErrorResponse } from "@response-entity";
import { getBodyFromRequest } from "@http-utils";
import { z } from "zod";
import { Env } from "@request-entity";
import { setupCountryBucket } from "@country-module";

const bodySchema = z.object({
  secretKey: z.string(),
});

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method !== HttpMethodEnum.POST) {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  try {
    const { secretKey } = bodySchema.parse(await getBodyFromRequest(request));

    if (!secretKey || secretKey !== env.SETUP_COUNTRIES_SECRET) {
      return errorResponse.UNAUTHORIZED();
    }

    return await setupCountryBucket();
  } catch (error) {
    return generateErrorResponse(error);
  }
};
