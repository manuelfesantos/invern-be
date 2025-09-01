import { successResponse } from "@response-entity";
import { getBodyFromRequest } from "@http-utils";
import {
  deleteCountry,
  getCountryByCountryCode,
  updateCountry,
} from "@country-module";
import { requestHandler } from "@decorator-utils";

export const onRequestPut = requestHandler(async ({ request, params }) => {
  const body = await getBodyFromRequest(request);
  const country = await updateCountry(params.code as string, body);
  return successResponse.OK("Countries updated successfully", country);
});

export const onRequestGet = requestHandler(async ({ params }) => {
  const countryCode = params.code as string;
  const country = await getCountryByCountryCode(countryCode);
  return successResponse.OK("Countries fetched successfully", country);
});

export const onRequestDelete = requestHandler(async ({ params }) => {
  const countryCode = params.code as string;
  const country = await deleteCountry(countryCode);
  return successResponse.OK("Countries deleted successfully", country);
});
