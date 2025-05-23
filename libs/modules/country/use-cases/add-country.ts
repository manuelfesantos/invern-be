import { Country, insertCountrySchema } from "@country-entity";
import {
  getSelectCountryByCodeAction,
  getInsertCountryAction,
} from "@country-db";

export const addCountry = async (body: unknown): Promise<Country> => {
  const countryInsert = insertCountrySchema.parse(body);
  const [{ code }] = await getInsertCountryAction(countryInsert).run();
  if (!code) {
    throw new Error("Failed to insert country");
  }
  const country = await getSelectCountryByCodeAction(code).run();
  if (!country) {
    throw new Error("Failed to insert country");
  }
  return country;
};
