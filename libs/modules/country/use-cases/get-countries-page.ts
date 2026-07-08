import type { Country } from "@country-entity";
import type { Paginated } from "@pagination-entity";
import { paginationQuerySchema, toPaginatedResponse } from "@pagination-entity";
import { runBatchOperationWithCount } from "@generics-db";
import { countriesTable } from "@schema";
import { getSelectCountriesPageAction } from "@country-db";

export const getCountriesPage = async (
  pagination?: unknown,
): Promise<Paginated<Country>> => {
  const { page, pageSize } = paginationQuerySchema.parse(pagination ?? {});
  const [total, countries] = await runBatchOperationWithCount(
    countriesTable,
    getSelectCountriesPageAction(page, pageSize),
  );
  return toPaginatedResponse(countries, { page, pageSize, total });
};
