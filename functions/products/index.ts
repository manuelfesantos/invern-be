import { errorResponse, generateErrorResponse } from "@response-entity";
import { initDb } from "@db-utils";
import { getAllProducts } from "@product-module";
import { setGlobalTimer } from "@timer-utils";
import { getQueryFromUrl } from "@http-utils";
import { Env } from "@request-entity";

export const onRequest: PagesFunction<Env> = async (
  context,
): Promise<Response> => {
  setGlobalTimer();
  const { request, env } = context;
  if (request.method !== "GET") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  try {
    initDb(env.INVERN_DB);

    const query = getQueryFromUrl(request.url);
    const search = query?.get("search") ?? null;

    return await getAllProducts(search);
  } catch (error) {
    return generateErrorResponse(error);
  }
};
