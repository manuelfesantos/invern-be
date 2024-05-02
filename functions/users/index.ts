import { initDb } from "@db-adapter";
import { loginSignupMapper } from "@user-module";
import { HttpHeaderEnum, HttpMethodEnum } from "@http-entity";
import { errorResponse } from "@response-entity";
import { setGlobalTimer } from "@timer-utils";

interface Env {
  INVERN_DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  setGlobalTimer();

  const { request, env } = context;

  if (request.method !== HttpMethodEnum.POST) {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  const body = await request.json();

  const action = request.headers.get(HttpHeaderEnum.ACTION);

  initDb(env.INVERN_DB);

  return await loginSignupMapper(body, action);
};
