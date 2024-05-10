import { initDb } from "@db-utils";
import { userActionMapper } from "@user-module";
import { HttpHeaderEnum, HttpMethodEnum } from "@http-entity";
import { errorResponse, generateErrorResponse } from "@response-entity";
import { setGlobalTimer } from "@timer-utils";
import { getBodyFromRequest } from "@http-utils";
import { Env } from "@request-entity";

export const onRequest: PagesFunction<Env> = async (
  context,
): Promise<Response> => {
  setGlobalTimer();

  const { request, env } = context;

  if (request.method !== HttpMethodEnum.POST) {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  try {
    const body = await getBodyFromRequest(request);

    const action = request.headers.get(HttpHeaderEnum.ACTION);

    initDb(env.INVERN_DB);

    return await userActionMapper(body, action);
  } catch (error: unknown) {
    return generateErrorResponse(error);
  }
};
