import { Country, InsertCountry } from "@country-entity";
import { runBatchOperation } from "@generics-db";
import {
  getSelectCountryByCodeAction,
  getUpdateCountryAction,
} from "@country-db";

export const updateCountryOperation = async (
  countryCode: string,
  countryUpdate: Partial<InsertCountry>,
): Promise<Country> => {
  const [, country] = await runBatchOperation(
    getUpdateCountryAction(countryCode, countryUpdate),
    getSelectCountryByCodeAction(countryCode),
  );

  if (!country) {
    throw new Error("Failed to update country");
  }

  return country;
};
