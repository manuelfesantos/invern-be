import type { Currency } from "@currency-entity";
import type { Paginated } from "@pagination-entity";
import { paginationQuerySchema, toPaginatedResponse } from "@pagination-entity";
import { runBatchOperationWithCount } from "@generics-db";
import { currenciesTable } from "@schema";
import { getSelectCurrenciesPageAction } from "@currency-db";

export const getCurrenciesPage = async (
  pagination?: unknown,
): Promise<Paginated<Currency>> => {
  const { page, pageSize } = paginationQuerySchema.parse(pagination ?? {});
  const [total, currencies] = await runBatchOperationWithCount(
    currenciesTable,
    getSelectCurrenciesPageAction(page, pageSize),
  );
  return toPaginatedResponse(currencies, { page, pageSize, total });
};
