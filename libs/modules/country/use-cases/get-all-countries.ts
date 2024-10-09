import { successResponse } from "@response-entity";
import { selectAllCountries } from "@country-db";

export const getAllCountries = async (): Promise<Response> => {
  const countries = await selectAllCountries();
  return successResponse.OK("success getting countries", countries);
};
