import { errorResponse, successResponse } from "@response-entity";
import { insertData } from "./_test-data";
// eslint-disable-next-line import/no-restricted-paths
import { initStripeClient } from "@stripe-adapter";
import { getBodyFromRequest } from "@http-utils";
import { z } from "zod";
import { requestHandler } from "@decorator-utils";
import { PagesFunction } from "@cloudflare/workers-types";
import { Env } from "@request-entity";

const testDataRequestBodySchema = z.object({
  secretKey: z.string(),
});

const POST: PagesFunction<Env> = async ({
  env,
  request,
}): Promise<Response> => {
  const body = await getBodyFromRequest(request);

  const { secretKey } = testDataRequestBodySchema.parse(body);

  if (!secretKey || secretKey !== env.INSERT_TEST_DATA_SECRET) {
    return errorResponse.FORBIDDEN("Missing or wrong secret key");
  }

  initStripeClient(env.STRIPE_API_KEY);
  await insertData();
  return successResponse.OK("success inserting test data");
};

export const onRequest = requestHandler({ POST });
