import type { InsertCurrency } from "@currency-entity";
import { currenciesTable } from "@schema";
import { db } from "@db";
import { actionBuilder } from "@generics-db";

const insertCurrencyQuery = (currency: InsertCurrency) =>
  db().insert(currenciesTable).values(currency).returning({
    code: currenciesTable.code,
  });

export const getInsertCurrencyAction = actionBuilder(insertCurrencyQuery);
