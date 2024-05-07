import { errorResponse, generateErrorResponse } from "@response-entity";
import { initDb } from "@db-utils";
import { getCollectionDetails } from "@collection-module";

interface Env {
  INVERN_DB: D1Database;
}
export const onRequest: PagesFunction<Env> = async (
  context,
): Promise<Response> => {
  const { request, params, env } = context;
  if (request.method !== "GET") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  const { id } = params;

  try {
    initDb(env.INVERN_DB);
    return await getCollectionDetails(id);
  } catch (error) {
    return generateErrorResponse(error);
  }
};
