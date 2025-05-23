import { Country } from "@country-entity";
import { countryCodeSchema } from "@global-entity";
import { getSelectCountryByCodeAction } from "@country-db";
import { errors } from "@error-handling-utils";

export const getCountryByCountryCode = async (
  countryCode: string,
): Promise<Country> => {
  const country = await getSelectCountryByCodeAction(
    countryCodeSchema.parse(countryCode.toUpperCase()),
  ).run();

  if (!country) {
    throw errors.COUNTRY_NOT_FOUND();
  }

  return country;
};
