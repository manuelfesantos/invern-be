import { errorResponse } from "@response-entity";
import { getBodyFromRequest } from "@http-utils";
import { z } from "zod";
import { setupCountryBucket } from "@country-module";
import { requestHandler } from "@decorator-utils";
import { PagesFunction } from "@cloudflare/workers-types";
import { Env } from "@request-entity";

const bodySchema = z.object({
  secretKey: z.string(),
});

const POST: PagesFunction<Env> = async ({ request, env }) => {
  const { secretKey } = bodySchema.parse(await getBodyFromRequest(request));

  if (!secretKey || secretKey !== env.SETUP_COUNTRIES_SECRET) {
    return errorResponse.UNAUTHORIZED();
  }

  return await setupCountryBucket();
};

export const onRequest = requestHandler({ POST });
