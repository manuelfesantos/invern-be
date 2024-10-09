import { selectAllCountries } from "@country-db";
import { countriesClient } from "@r2-adapter";
import { successResponse } from "@response-entity";

export const setupCountryBucket = async (): Promise<Response> => {
  const countries = await selectAllCountries();
  await countriesClient.update(countries);
  return successResponse.OK("Successfully updated all countries in bucket");
};
