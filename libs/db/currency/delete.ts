import { currenciesTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";

export const deleteCurrency = async (currencyCode: string): Promise<void> => {
  await db()
    .delete(currenciesTable)
    .where(eq(currenciesTable.code, currencyCode));
};
