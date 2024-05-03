import { setGlobalTimer } from "@timer-utils";
import { errorResponse } from "@response-entity";
import { initDb } from "@db-adapter";
import { getAllCollections } from "@collection-module";

interface Env {
  INVERN_DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (
  context,
): Promise<Response> => {
  setGlobalTimer();
  const { request, env } = context;
  if (request.method !== "GET") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }
  initDb(env.INVERN_DB);

  return await getAllCollections();
};
