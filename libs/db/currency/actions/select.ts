import { currenciesTable } from "@schema";
import type { SQL } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { actionBuilder } from "@generics-db";
import { DEFAULT_PAGE } from "@number-utils";

const selectCurrencyByCodeQuery = (currencyCode: string) =>
  db().query.currenciesTable.findFirst({
    where: eq(currenciesTable.code, currencyCode),
  });

const selectAllCurrenciesQuery = () => db().query.currenciesTable.findMany();

const selectCurrenciesPageQuery = (
  page: number,
  pageSize: number,
  where?: SQL,
  orderBy?: SQL[],
) =>
  db().query.currenciesTable.findMany({
    ...(where && { where }),
    ...(orderBy && { orderBy }),
    limit: pageSize,
    offset: (page - DEFAULT_PAGE) * pageSize,
  });

export const getSelectCurrencyByCodeAction = actionBuilder(
  selectCurrencyByCodeQuery,
);

export const getSelectAllCurrenciesAction = actionBuilder(
  selectAllCurrenciesQuery,
);

export const getSelectCurrenciesPageAction = actionBuilder(
  selectCurrenciesPageQuery,
);
