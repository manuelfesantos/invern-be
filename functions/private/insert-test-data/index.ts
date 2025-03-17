import { errorResponse, successResponse } from "@response-entity";
import { insertData } from "./_test-data";
import { getBodyFromRequest } from "@http-utils";
import { z } from "zod";
import { requestHandler } from "@decorator-utils";
import { PagesFunction } from "@cloudflare/workers-types";
import { Env } from "@request-entity";
import { ENV } from "@env-utils";

const testDataRequestBodySchema = z.object({
  secretKey: z.string(),
});

const POST: PagesFunction<Env> = async ({ request }): Promise<Response> => {
  const body = await getBodyFromRequest(request);

  const { secretKey } = testDataRequestBodySchema.parse(body);

  if (!secretKey || secretKey !== ENV.INSERT_TEST_DATA_SECRET) {
    return errorResponse.FORBIDDEN("Missing or wrong secret key");
  }

  await insertData();
  return successResponse.OK("success inserting test data");
};

export const onRequest = requestHandler({ POST });
