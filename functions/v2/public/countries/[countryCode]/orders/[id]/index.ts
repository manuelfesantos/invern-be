import { errorResponse, generateErrorResponse } from "@response-entity";
import { getOrder } from "@order-module";
import { CountriesEndpointData, Env } from "@request-entity";

export const onRequest: PagesFunction<
  Env,
  string,
  CountriesEndpointData
> = async (context) => {
  const { request, params, data } = context;
  const { id } = params;
  if (request.method !== "GET") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }
  try {
    return await getOrder(id, data.country);
  } catch (error) {
    return generateErrorResponse(error);
  }
};
