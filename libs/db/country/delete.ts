import { db } from "@db";
import { countriesTable } from "@schema";
import { eq } from "drizzle-orm";

export const deleteCountry = async (countryCode: string): Promise<void> => {
  await db().delete(countriesTable).where(eq(countriesTable.code, countryCode));
};
