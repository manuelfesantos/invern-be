import { PagesFunction } from "@cloudflare/workers-types";
import {
  errorResponse,
  generateErrorResponse,
  successResponse,
} from "@response-entity";
import { Env } from "@request-entity";
import { insertData } from "./test-data";

export const onRequest: PagesFunction<Env> = async (
  context,
): Promise<Response> => {
  const { request } = context;
  if (request.method !== "GET") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  try {
    await insertData();
    return successResponse.OK("success inserting test data");
  } catch (error) {
    return generateErrorResponse(error);
  }
};
