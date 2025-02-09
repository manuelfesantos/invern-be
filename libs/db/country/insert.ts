import { db } from "@db";
import { countriesTable } from "@schema";
import { InsertCountry } from "@country-entity";

export const insertCountry = async (
  country: InsertCountry,
): Promise<
  {
    code: string;
  }[]
> => {
  return db().insert(countriesTable).values(country).returning({
    code: countriesTable.code,
  });
};
