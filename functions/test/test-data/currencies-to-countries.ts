import { db } from "@db";
import { countriesToCurrenciesTable } from "@schema";

const currenciesToCountries = [
  {
    currencyCode: "EUR",
    countryCode: "PT",
  },
  {
    currencyCode: "EUR",
    countryCode: "ES",
  },
];

export const insertCurrenciesToCountries = async (): Promise<void> => {
  await db().insert(countriesToCurrenciesTable).values(currenciesToCountries);
};
