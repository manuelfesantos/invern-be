// eslint-disable-next-line import/no-restricted-paths
import { db } from "@db";
import { countriesTable } from "@schema";
import { InsertCountry } from "@country-entity";

const countriesList: InsertCountry[] = [
  {
    name: "Portugal",
    code: "PT",
    locale: "pt-PT",
    currencyCode: "EUR",
  },
  {
    name: "Spain",
    code: "ES",
    locale: "es-ES",
    currencyCode: "EUR",
  },
];

export const insertCountries = async (): Promise<{ countryCode: string }[]> => {
  return db().insert(countriesTable).values(countriesList).returning({
    countryCode: countriesTable.code,
  });
};
