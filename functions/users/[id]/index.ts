import {
  getBodyFromRequest,
  HttpHeaderEnum,
  HttpMethodEnum,
} from "@http-entity";
import { initDb } from "@db-adapter";
import { deleteUser, getUser, updateUser } from "@user-module";
import { errorResponse } from "@response-entity";
import { setGlobalTimer } from "@timer-utils";

interface Env {
  INVERN_DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  setGlobalTimer();
  const { request, params, env } = context;
  const { id } = params;

  const body = await getBodyFromRequest(request);

  initDb(env.INVERN_DB);

  if (request.method === HttpMethodEnum.GET) {
    return await getUser(id);
  }
  if (request.method === HttpMethodEnum.DELETE) {
    return await deleteUser(id);
  }

  if (request.method === HttpMethodEnum.PUT) {
    const action = request.headers.get(HttpHeaderEnum.ACTION);
    return await updateUser(id, body, action);
  }

  return errorResponse.METHOD_NOT_ALLOWED();
};
