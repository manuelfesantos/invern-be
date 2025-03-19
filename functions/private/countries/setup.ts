import { errorResponse } from "@response-entity";
import { getBodyFromRequest } from "@http-utils";
import { z } from "zod";
import { setupCountryBucket } from "@country-module";
import { requestHandler } from "@decorator-utils";
import { PagesFunction } from "@cloudflare/workers-types";
import { ENV } from "@env-utils";

const bodySchema = z.object({
  secretKey: z.string(),
});

const POST: PagesFunction = async ({ request }) => {
  const { secretKey } = bodySchema.parse(await getBodyFromRequest(request));

  if (!secretKey || secretKey !== ENV.SETUP_COUNTRIES_SECRET) {
    return errorResponse.UNAUTHORIZED();
  }

  return await setupCountryBucket();
};

export const onRequest = requestHandler({ POST });
