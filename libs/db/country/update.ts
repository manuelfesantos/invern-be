import { CountryEnumType, InsertCountry } from "@country-entity";
import { countriesTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { contextStore } from "@context-utils";

export const updateCountry = async (
  countryCode: CountryEnumType,
  changes: Partial<InsertCountry>,
): Promise<void> => {
  await (contextStore.context.transaction ?? db())
    .update(countriesTable)
    .set(changes)
    .where(eq(countriesTable.code, countryCode));
};
