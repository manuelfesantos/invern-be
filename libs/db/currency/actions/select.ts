import { currenciesTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { actionBuilder } from "@generics-db";

const selectCurrencyByCodeQuery = (currencyCode: string) =>
  db().query.currenciesTable.findFirst({
    where: eq(currenciesTable.code, currencyCode),
  });

const selectAllCurrenciesQuery = () => db().query.currenciesTable.findMany();

export const getSelectCurrencyByCodeAction = actionBuilder(
  selectCurrencyByCodeQuery,
);

export const getSelectAllCurrenciesAction = actionBuilder(
  selectAllCurrenciesQuery,
);
