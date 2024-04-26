import { PagesFunction } from "@cloudflare/workers-types";
import { successResponse } from "@entities/response/success-response";
import { errorResponse } from "@entities/response/error-response";

export const onRequest: PagesFunction = async (context) => {
  const { request } = context;
  if (request.method !== "GET") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }
  return successResponse.OK("Hello World");
};
