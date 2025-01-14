import { errorResponse, generateErrorResponse } from "@response-entity";
import { getAllProducts } from "@product-module";
import { getQueryFromUrl } from "@http-utils";
import { CountriesEndpointData, Env } from "@request-entity";

export const onRequest: PagesFunction<
  Env,
  string,
  CountriesEndpointData
> = async (context): Promise<Response> => {
  const { request, data } = context;
  if (request.method !== "GET") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  try {
    const query = getQueryFromUrl(request.url);
    const search = query?.get("search") ?? null;

    return await getAllProducts(search, data.country);
  } catch (error) {
    return generateErrorResponse(error);
  }
};
