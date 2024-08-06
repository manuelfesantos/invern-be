import { getCountryByCode } from "@country-db";
import { Country } from "@country-entity";

export const getCountry = async (
  country: string,
): Promise<Country | undefined> => {
  return await getCountryByCode(country);
};
