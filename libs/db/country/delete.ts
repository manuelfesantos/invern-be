import { db } from "@db";
import { contextStore } from "@context-utils";
import { countriesTable } from "@schema";
import { eq } from "drizzle-orm";
import { CountryEnumType } from "@country-entity";

export const deleteCountry = async (
  countryCode: CountryEnumType,
): Promise<void> => {
  await (contextStore.context.transaction ?? db())
    .delete(countriesTable)
    .where(eq(countriesTable.code, countryCode));
};
