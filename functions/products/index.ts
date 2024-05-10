import { errorResponse, generateErrorResponse } from "@response-entity";
import { getAllProducts } from "@product-module";
import { setGlobalTimer } from "@timer-utils";
import { getQueryFromUrl } from "@http-utils";

export const onRequest: PagesFunction = async (context): Promise<Response> => {
  setGlobalTimer();
  const { request } = context;
  if (request.method !== "GET") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  try {
    const query = getQueryFromUrl(request.url);
    const search = query?.get("search") ?? null;

    return await getAllProducts(search);
  } catch (error) {
    return generateErrorResponse(error);
  }
};
