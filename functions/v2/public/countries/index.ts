import { HttpMethodEnum } from "@http-entity";
import { errorResponse } from "@response-entity";
import { getAllCountries } from "@country-module";

export const onRequest: PagesFunction = async ({ request }) => {
  if (request.method !== HttpMethodEnum.GET) {
    return errorResponse.METHOD_NOT_ALLOWED();
  }
  return await getAllCountries();
};
