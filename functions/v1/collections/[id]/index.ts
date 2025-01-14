import { errorResponse, generateErrorResponse } from "@response-entity";
import { getCollectionDetails } from "@collection-module";

export const onRequest: PagesFunction = async (context): Promise<Response> => {
  const { request, params } = context;
  if (request.method !== "GET") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  const { id } = params;

  try {
    return await getCollectionDetails(id as string);
  } catch (error) {
    return generateErrorResponse(error);
  }
};
