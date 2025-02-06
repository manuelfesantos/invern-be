import { db } from "@db";
import { countriesTable } from "@schema";
import { eq } from "drizzle-orm";
import { CountryEnumType } from "@country-entity";

export const deleteCountry = async (
  countryCode: CountryEnumType,
): Promise<void> => {
  await db().delete(countriesTable).where(eq(countriesTable.code, countryCode));
};
