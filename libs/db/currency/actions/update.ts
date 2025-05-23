import { InsertCurrency } from "@currency-entity";
import { currenciesTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { actionBuilder } from "@generics-db";

const updateCurrencyQuery = (
  currencyCode: string,
  changes: Partial<InsertCurrency>,
) =>
  db()
    .update(currenciesTable)
    .set(changes)
    .where(eq(currenciesTable.code, currencyCode));

export const getUpdateCurrencyAction = actionBuilder(updateCurrencyQuery);
