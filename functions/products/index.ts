import { errorResponse } from "@response-entity";
import { initDb } from "@db-adapter";
import { getAllProducts } from "@product-module";
import { getQueryFromUrl } from "@http-entity";
import { setGlobalTimer } from "@timer-utils";

interface Env {
  INVERN_DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  setGlobalTimer();
  const { request, env } = context;
  if (request.method !== "GET") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  initDb(env.INVERN_DB);

  const query = getQueryFromUrl(request.url);
  const search = query?.get("search") ?? null;
  return await getAllProducts(search);
};
