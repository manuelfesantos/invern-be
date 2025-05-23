import { Country, insertCountrySchema } from "@country-entity";
import { updateCountryOperation } from "./operations/update-country";

export const updateCountry = async (
  countryCode: string,
  body: unknown,
): Promise<Country> => {
  const countryUpdate = insertCountrySchema.parse(body);
  return await updateCountryOperation(countryCode, countryUpdate);
};
