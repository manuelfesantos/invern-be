import { InsertCurrency } from "@currency-entity";
import { currenciesTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";

export const updateCurrency = async (
  currencyCode: string,
  changes: Partial<InsertCurrency>,
): Promise<void> => {
  await db()
    .update(currenciesTable)
    .set(changes)
    .where(eq(currenciesTable.code, currencyCode));
};
