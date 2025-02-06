import { db } from "@db";
import { countriesTable } from "@schema";
import { CountryEnumType, InsertCountry } from "@country-entity";

export const insertCountry = async (
  country: InsertCountry,
): Promise<
  {
    code: CountryEnumType;
  }[]
> => {
  return db().insert(countriesTable).values(country).returning({
    code: countriesTable.code,
  });
};
