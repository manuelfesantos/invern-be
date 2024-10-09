import { db } from "@db";
import { countriesTable } from "@schema";
import { InsertCountry } from "@country-entity";

const countriesList: InsertCountry[] = [
  {
    name: "Portugal",
    code: "PT",
  },
  {
    name: "Spain",
    code: "ES",
  },
];

export const insertCountries = async (): Promise<{ countryCode: string }[]> => {
  return db().insert(countriesTable).values(countriesList).returning({
    countryCode: countriesTable.code,
  });
};
