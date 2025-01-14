import { errorResponse, generateErrorResponse } from "@response-entity";
import { getAllCollections } from "@collection-module";

export const onRequest: PagesFunction = async (context): Promise<Response> => {
  const { request } = context;
  if (request.method !== "GET") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }
  try {
    return await getAllCollections();
  } catch (error) {
    return generateErrorResponse(error);
  }
};
