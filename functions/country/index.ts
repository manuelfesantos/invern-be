import { PagesFunction } from "@cloudflare/workers-types";
import {
  errorResponse,
  generateErrorResponse,
  prepareError,
  successResponse,
} from "@response-entity";
import { getCountry } from "@country-module";

export const onRequest: PagesFunction = async (context) => {
  const { request } = context;
  if (request.method !== "GET") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }
  try {
    const { country } = request.cf ?? {};
    if (!country) {
      return errorResponse.BAD_REQUEST(prepareError("country is required"));
    }
    const countryData = await getCountry(country);
    if (!countryData) {
      return errorResponse.NOT_FOUND(prepareError("Country not found"));
    }
    return successResponse.OK("success getting country", countryData);
  } catch (error) {
    return generateErrorResponse(error);
  }
};
