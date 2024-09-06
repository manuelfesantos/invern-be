import { successResponse } from "@response-entity";
import { getAllCountries as getAllCountriesDb } from "@country-db";

export const getAllCountries = async (): Promise<Response> => {
  const countries = await getAllCountriesDb();
  return successResponse.OK("success getting countries", countries);
};
