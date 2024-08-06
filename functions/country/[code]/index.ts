import { PagesFunction } from "@cloudflare/workers-types";
import {
  errorResponse,
  generateErrorResponse,
  successResponse,
} from "@response-entity";
import { getCountry } from "@country-module";

export const onRequest: PagesFunction = async (context) => {
  const { request, params } = context;
  const { code } = params;
  if (request.method !== "GET") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }
  try {
    const country = await getCountry(code as string);
    if (!country) {
      return errorResponse.NOT_FOUND();
    }
    return successResponse.OK("success getting country", country);
  } catch (error) {
    return generateErrorResponse(error);
  }
};
