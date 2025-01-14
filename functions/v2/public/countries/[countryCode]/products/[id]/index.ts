import { HttpMethodEnum } from "@http-entity";
import { errorResponse, generateErrorResponse } from "@response-entity";
import { getProductDetails } from "@product-module";
import { CountriesEndpointData, Env } from "@request-entity";

export const onRequest: PagesFunction<
  Env,
  string,
  CountriesEndpointData
> = async (context): Promise<Response> => {
  const { request, params, data } = context;
  if (request.method !== HttpMethodEnum.GET) {
    return errorResponse.METHOD_NOT_ALLOWED();
  }
  const { id } = params;

  try {
    return await getProductDetails(id, data.country);
  } catch (error) {
    return generateErrorResponse(error);
  }
};
