import { db } from "@db";
import { contextStore } from "@context-utils";
import { countriesTable } from "@schema";
import { CountryEnumType, InsertCountry } from "@country-entity";

export const insertCountry = async (
  country: InsertCountry,
): Promise<
  {
    code: CountryEnumType;
  }[]
> => {
  return (contextStore.context.transaction ?? db())
    .insert(countriesTable)
    .values(country)
    .returning({
      code: countriesTable.code,
    });
};
