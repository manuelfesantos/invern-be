import { currenciesTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { actionBuilder } from "@generics-db";

const deleteCurrencyQuery = (currencyCode: string) =>
  db().delete(currenciesTable).where(eq(currenciesTable.code, currencyCode));

export const getDeleteCurrencyAction = actionBuilder(deleteCurrencyQuery);
