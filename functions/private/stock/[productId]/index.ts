import { errorResponse, successResponse } from "@response-entity";
import { Env } from "@request-entity";
// eslint-disable-next-line import/no-restricted-paths
import { stockClient } from "@r2-adapter";
import { requestHandler } from "@decorator-utils";
import { PagesFunction } from "@cloudflare/workers-types";

const GET: PagesFunction<Env> = async ({ env, params }) => {
  const isLocalRequest = env.ENV === "local";

  if (!isLocalRequest) {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  const { productId } = params;
  if (!productId) {
    return errorResponse.BAD_REQUEST("productId is required");
  }
  const response = await stockClient.get(productId as string);
  if (!response) {
    return errorResponse.NOT_FOUND("product not found");
  }

  return successResponse.OK("success getting stock", response.data, {
    "Access-Control-Allow-Origin": env.FRONTEND_HOST,
  });
};

export const onRequest = requestHandler({ GET });
