import { successResponse } from "@response-entity";
import { addCountry, getAllCountries } from "@country-module";
import { getBodyFromRequest } from "@http-utils";
import { requestHandler } from "@decorator-utils";

export const onRequestGet = requestHandler(async () => {
  const countries = await getAllCountries();
  return successResponse.OK("Countries fetched successfully", countries);
});

export const onRequestPost = requestHandler(async ({ request }) => {
  const body = await getBodyFromRequest(request);
  const country = await addCountry(body);
  return successResponse.OK("Countries fetched successfully", country);
});
