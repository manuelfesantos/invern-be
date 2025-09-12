import type { Country } from "@country-entity";
import { getSelectCountryByCodeAction } from "@country-db";
import { errors } from "@error-handling-utils";
import * as z from "zod";

export const getCountryByCountryCode = async (
  countryCode: string,
): Promise<Country> => {
  const country = await getSelectCountryByCodeAction(
    z
      .string()
      .regex(/^[A-Z]{2}$/)
      .parse(countryCode.toUpperCase()),
  ).run();

  if (!country) {
    throw errors.COUNTRY_NOT_FOUND();
  }

  return country;
};
