import { errorResponse } from "@response-entity";
import { initDb } from "@db-adapter";
import { getCollectionDetails } from "@collection-module";

interface Env {
  INVERN_DB: D1Database;
}
export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, params, env } = context;
  if (request.method !== "GET") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  const { id } = params;

  initDb(env.INVERN_DB);

  return await getCollectionDetails(id);
};
