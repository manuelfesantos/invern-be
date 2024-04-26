import {
  getBodyFromRequest,
  HttpHeaderEnum,
  HttpMethodEnum,
} from "@entities/http/http-request";
import { initDb } from "@adapters/db";
import { getUser } from "@apps/get-user/get-user";
import { deleteUser } from "@apps/delete-user/delete-user";
import { updateUser } from "@apps/update-user";
import { errorResponse } from "@entities/response/error-response";
import { setTimers } from "@utils/timer";

interface Env {
  INVERN_DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
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
