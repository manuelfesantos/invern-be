import { initDb } from "@adapters/db";
import { HttpHeaderEnum, HttpMethodEnum } from "@entities/http/http-request";
import { errorResponse } from "@entities/response/error-response";
import { loginSignupMapper } from "@apps/login-signup/login-signup-mapper";
import {
  getGlobalPassedTime,
  getPassedTime,
  setTimer,
  setTimers,
} from "@utils/timer";

interface Env {
  INVERN_DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  if (request.method !== HttpMethodEnum.POST) {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  const body = await request.json();

  const action = request.headers.get(HttpHeaderEnum.ACTION);

  initDb(env.INVERN_DB);

  return await loginSignupMapper(body, action);
};
