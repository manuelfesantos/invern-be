import { Country } from "@country-entity";
import { countryCodeSchema } from "@global-entity";
import { getCountryByCode } from "@country-db";

export const getCountryByCountryCode = async (
  countryCode: string,
): Promise<Country | undefined> => {
  return await getCountryByCode(
    countryCodeSchema.parse(countryCode.toUpperCase()),
  );
};
