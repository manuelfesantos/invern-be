import { Country, countryEnumSchema } from "@country-entity";
import { getCountryByCode } from "@country-db";

export const getCountryByCountryCode = async (
  countryCode: string,
): Promise<Country | undefined> => {
  return await getCountryByCode(
    countryEnumSchema.parse(countryCode.toUpperCase()),
  );
};
