import { currenciesTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { contextStore } from "@context-utils";

export const deleteCurrency = async (currencyCode: string): Promise<void> => {
  await (contextStore.context.transaction ?? db())
    .delete(currenciesTable)
    .where(eq(currenciesTable.code, currencyCode));
};
