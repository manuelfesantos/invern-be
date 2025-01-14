import { errorResponse, generateErrorResponse } from "@response-entity";
import { getCollectionDetails } from "@collection-module";
import { CountriesEndpointData, Env } from "@request-entity";

export const onRequest: PagesFunction<
  Env,
  string,
  CountriesEndpointData
> = async (context): Promise<Response> => {
  const { request, params, data } = context;
  if (request.method !== "GET") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  const { id } = params;

  try {
    return await getCollectionDetails(id as string, data.country);
  } catch (error) {
    return generateErrorResponse(error);
  }
};
