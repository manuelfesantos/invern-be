import { errorResponse, generateErrorResponse } from "@response-entity";
import { HttpHeaderEnum, HttpMethodEnum } from "@http-entity";
import { initDb } from "@db-adapter";
import { updateCart } from "@cart-module";
import { setGlobalTimer } from "@timer-utils";

interface Env {
  INVERN_DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (
  context,
): Promise<Response> => {
  setGlobalTimer();

  const { request, params, env } = context;
  const { id } = params;

  if (request.method !== HttpMethodEnum.PUT) {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  const { headers } = request;
  const action = headers.get(HttpHeaderEnum.ACTION);

  if (!action) {
    return errorResponse.BAD_REQUEST("action is required");
  }

  try {
    const body = await request.json();

    initDb(env.INVERN_DB);

    return await updateCart(body, action, id);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.includes("JSON")) {
        return errorResponse.BAD_REQUEST(error.message);
      }
    }
    return generateErrorResponse(error);
  }
};
