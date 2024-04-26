import { initDb } from "@adapters/db";
import {
  getBodyFromRequest,
  HttpHeaderEnum,
  HttpMethodEnum,
} from "@entities/http/http-request";
import { updateUser } from "@apps/update-user";
import { errorResponse } from "@entities/response/error-response";
import { loginSignupMapper } from "@apps/login-signup/login-signup-mapper";
import { startTimer } from "@utils/time/timer";

interface Env {
  INVERN_DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  startTimer();
  const { request, env } = context;
  const body = await getBodyFromRequest(request);
  const action = request.headers.get(HttpHeaderEnum.ACTION);

  initDb(env.INVERN_DB);

  if (request.method === HttpMethodEnum.POST) {
    return await loginSignupMapper(body, action);
  } else if (request.method === HttpMethodEnum.PUT) {
    return await updateUser(body, action);
  }
  return errorResponse.METHOD_NOT_ALLOWED();
};
