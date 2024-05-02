import { PagesFunction } from "@cloudflare/workers-types";
import { errorResponse, successResponse } from "@response-entity";
import { setGlobalTimer } from "@timer-utils";

export const onRequest: PagesFunction = async (context) => {
  setGlobalTimer();
  const { request } = context;
  if (request.method !== "GET") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }
  return successResponse.OK("Welcome to Invern Spirit!");
};
