import { errorResponse, generateErrorResponse } from "@response-entity";
import { getOrder } from "@order-module";

export const onRequest: PagesFunction = async (context) => {
  const { request, params } = context;
  const { id } = params;
  if (request.method !== "GET") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }
  try {
    return await getOrder(id);
  } catch (error) {
    return generateErrorResponse(error);
  }
};
