import { PagesFunction } from "@cloudflare/workers-types";
import { errorResponse, successResponse } from "@response-entity";
import { setGlobalTimer } from "@timer-utils";
import { getLogger } from "@logger-utils";

export const onRequest: PagesFunction = async (context): Promise<Response> => {
  setGlobalTimer();
  const { request } = context;
  if (request.method !== "GET") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  getLogger().addData({ response: "Welcome to Invern Spirit!" });

  return successResponse.OK("Welcome to Invern Spirit!");
};
