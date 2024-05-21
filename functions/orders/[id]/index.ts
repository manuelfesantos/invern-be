import { errorResponse, successResponse } from "@response-entity";

export const onRequest: PagesFunction = async (context) => {
  const { request, params } = context;
  const { id } = params;
  if (request.method !== "GET") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }
  return successResponse.OK("success getting checkout-session", id);
};
