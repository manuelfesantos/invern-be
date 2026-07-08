import type { Currency } from "@currency-entity";
import type { Paginated } from "@pagination-entity";
import { parseListQuery, toPaginatedResponse } from "@pagination-entity";
import {
  buildOrderBy,
  buildWhere,
  likeFilter,
  runBatchOperationWithCount,
} from "@generics-db";
import { currenciesTable } from "@schema";
import { getSelectCurrenciesPageAction } from "@currency-db";

const CURRENCY_SORT_MAP = {
  name: currenciesTable.name,
  code: currenciesTable.code,
  rateToEuro: currenciesTable.rateToEuro,
  createdAt: currenciesTable.createdAt,
};

const CURRENCY_FILTER_MAP = {
  name: likeFilter(currenciesTable.name),
  code: likeFilter(currenciesTable.code),
};

export const getCurrenciesPage = async (
  query?: unknown,
): Promise<Paginated<Currency>> => {
  const { page, pageSize, sortBy, sortOrder } = parseListQuery(
    ["name", "code", "rateToEuro", "createdAt"],
    query,
  );
  const filters = (query ?? {}) as Record<string, string | undefined>;

  const where = buildWhere(CURRENCY_FILTER_MAP, filters);
  const orderBy = buildOrderBy(CURRENCY_SORT_MAP, sortBy, sortOrder);

  const [total, currencies] = await runBatchOperationWithCount(
    currenciesTable,
    getSelectCurrenciesPageAction(page, pageSize, where, orderBy),
    where,
  );
  return toPaginatedResponse(currencies, { page, pageSize, total });
};
