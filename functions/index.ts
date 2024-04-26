import { PagesFunction } from "@cloudflare/workers-types";
import { successResponse } from "@entities/response/success-response";
import { errorResponse } from "@entities/response/error-response";
import { startTimer } from "@utils/time/timer";

export const onRequest: PagesFunction = async (context) => {
  startTimer();
  const { request } = context;
  if (request.method !== "GET") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }
  return successResponse.OK("Hello World");
};
