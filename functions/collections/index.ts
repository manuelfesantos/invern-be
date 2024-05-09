import { setGlobalTimer } from "@timer-utils";
import { errorResponse, generateErrorResponse } from "@response-entity";
import { initDb } from "@db-utils";
import { getAllCollections } from "@collection-module";
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
    return await getAllCollections();
  } catch (error) {
    return generateErrorResponse(error);
  }
};
