import {
  errorResponse,
  generateErrorResponse,
  successResponse,
} from "@response-entity";
import { Env } from "@request-entity";
import { insertData } from "./test-data";
import { initStripeClient } from "@stripe-adapter";
import { getBodyFromRequest } from "@http-utils";
import { z } from "zod";
import { HttpMethodEnum } from "@http-entity";

const testDataRequestBodySchema = z.object({
  secretKey: z.string(),
});

export const onRequest: PagesFunction<Env> = async ({
  env,
  request,
}): Promise<Response> => {
  if (request.method !== HttpMethodEnum.POST) {
    return errorResponse.METHOD_NOT_ALLOWED();
  }
  const body = await getBodyFromRequest(request);

  const { secretKey } = testDataRequestBodySchema.parse(body);

  if (!secretKey || secretKey !== env.INSERT_TEST_DATA_SECRET) {
    return errorResponse.FORBIDDEN("Missing or wrong secret key");
  }

  initStripeClient(env.STRIPE_API_KEY);
  try {
    await insertData();
    return successResponse.OK("success inserting test data");
  } catch (error) {
    return generateErrorResponse(error);
  }
};
