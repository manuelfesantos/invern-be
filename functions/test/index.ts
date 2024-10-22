import { generateErrorResponse, successResponse } from "@response-entity";
import { Env } from "@request-entity";
import { insertData } from "./test-data";
import { initStripeClient } from "@stripe-adapter";

export const onRequest: PagesFunction<Env> = async ({
  env,
}): Promise<Response> => {
  initStripeClient(env.STRIPE_API_KEY);
  try {
    await insertData();
    return successResponse.OK("success inserting test data");
  } catch (error) {
    return generateErrorResponse(error);
  }
};
