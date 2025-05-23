import { successResponse } from "@response-entity";
import { addCountry, getAllCountries } from "@country-module";
import { getBodyFromRequest } from "@http-utils";
import { requestHandler } from "@decorator-utils";

const GET: PagesFunction = async () => {
  const countries = await getAllCountries();
  return successResponse.OK("Countries fetched successfully", countries);
};

const POST: PagesFunction = async ({ request }) => {
  const body = await getBodyFromRequest(request);
  const country = await addCountry(body);
  return successResponse.OK("Countries fetched successfully", country);
};

export const onRequest = requestHandler({ GET, POST });
