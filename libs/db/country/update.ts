import { CountryEnumType, InsertCountry } from "@country-entity";
import { countriesTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";

export const updateCountry = async (
  countryCode: CountryEnumType,
  changes: Partial<InsertCountry>,
): Promise<void> => {
  await db()
    .update(countriesTable)
    .set(changes)
    .where(eq(countriesTable.code, countryCode));
};
