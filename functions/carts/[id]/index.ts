import { errorResponse, generateErrorResponse } from "@response-entity";
import { HttpHeaderEnum, HttpMethodEnum } from "@http-entity";
import { initDb } from "@db-utils";
import { updateCart } from "@cart-module";
import { setGlobalTimer } from "@timer-utils";
import { getBodyFromRequest } from "@http-utils";
import { Env } from "@request-entity";

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
    const body = await getBodyFromRequest(request);

    initDb(env.INVERN_DB);

    return await updateCart(body, action, id);
  } catch (error: unknown) {
    return generateErrorResponse(error);
  }
};
