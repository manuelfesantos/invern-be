import { setGlobalTimer } from "@timer-utils";
import { HttpMethodEnum } from "@http-entity";
import { errorResponse, generateErrorResponse } from "@response-entity";
import { getProductDetails } from "@product-module";

export const onRequest: PagesFunction = async (context): Promise<Response> => {
  setGlobalTimer();
  const { request, params } = context;
  if (request.method !== HttpMethodEnum.GET) {
    return errorResponse.METHOD_NOT_ALLOWED();
  }
  const { id } = params;

  try {
    return await getProductDetails(id);
  } catch (error) {
    return generateErrorResponse(error);
  }
};
