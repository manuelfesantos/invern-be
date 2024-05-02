import { setGlobalTimer } from "@timer-utils";
import { HttpMethodEnum } from "@http-entity";
import { errorResponse } from "@response-entity";
import { getProductDetails } from "@product-module";

interface Env {
  INVERN_DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  setGlobalTimer();
  const { request, params, env } = context;
  if (request.method !== HttpMethodEnum.GET) {
    return errorResponse.METHOD_NOT_ALLOWED();
  }
  const { id } = params;
  return await getProductDetails(id);
};
