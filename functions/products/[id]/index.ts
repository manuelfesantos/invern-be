import { setGlobalTimer } from "@timer-utils";
import { HttpMethodEnum } from "@http-entity";
import { errorResponse, generateErrorResponse } from "@response-entity";
import { getProductDetails } from "@product-module";
import { initDb } from "@db-adapter";

interface Env {
  INVERN_DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (
  context,
): Promise<Response> => {
  setGlobalTimer();
  const { request, params, env } = context;
  if (request.method !== HttpMethodEnum.GET) {
    return errorResponse.METHOD_NOT_ALLOWED();
  }
  const { id } = params;

  try {
    initDb(env.INVERN_DB);
    return await getProductDetails(id);
  } catch (error) {
    return generateErrorResponse(error);
  }
};
