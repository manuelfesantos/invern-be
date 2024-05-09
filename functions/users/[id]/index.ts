import { HttpHeaderEnum, HttpMethodEnum } from "@http-entity";
import { initDb } from "@db-utils";
import { deleteUser, getUser, updateUser } from "@user-module";
import { errorResponse, generateErrorResponse } from "@response-entity";
import { setGlobalTimer } from "@timer-utils";
import { getBodyFromRequest } from "@http-utils";
import { Env } from "@request-entity";

export const onRequest: PagesFunction<Env> = async (
  context,
): Promise<Response> => {
  setGlobalTimer();
  const { request, params, env } = context;
  const { id } = params;

  try {
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
  } catch (error: unknown) {
    return generateErrorResponse(error);
  }
};
