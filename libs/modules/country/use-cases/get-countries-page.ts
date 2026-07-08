import type { Country } from "@country-entity";
import type { Paginated } from "@pagination-entity";
import { parseListQuery, toPaginatedResponse } from "@pagination-entity";
import {
  buildOrderBy,
  buildWhere,
  eqFilter,
  likeFilter,
  runBatchOperationWithCount,
} from "@generics-db";
import { countriesTable } from "@schema";
import { getSelectCountriesPageAction } from "@country-db";

const COUNTRY_SORT_MAP = {
  name: countriesTable.name,
  code: countriesTable.code,
  createdAt: countriesTable.createdAt,
};

const COUNTRY_FILTER_MAP = {
  name: likeFilter(countriesTable.name),
  code: likeFilter(countriesTable.code),
  currencyCode: eqFilter(countriesTable.currencyCode),
};

export const getCountriesPage = async (
  query?: unknown,
): Promise<Paginated<Country>> => {
  const { page, pageSize, sortBy, sortOrder } = parseListQuery(
    ["name", "code", "createdAt"],
    query,
  );
  const filters = (query ?? {}) as Record<string, string | undefined>;

  const where = buildWhere(COUNTRY_FILTER_MAP, filters);
  const orderBy = buildOrderBy(COUNTRY_SORT_MAP, sortBy, sortOrder);

  const [total, countries] = await runBatchOperationWithCount(
    countriesTable,
    getSelectCountriesPageAction(page, pageSize, where, orderBy),
    where,
  );
  return toPaginatedResponse(countries, { page, pageSize, total });
};
