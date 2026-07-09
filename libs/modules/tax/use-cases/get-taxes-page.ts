import type { AdminTax } from "@tax-entity";
import type { Paginated } from "@pagination-entity";
import { parseListQuery, toPaginatedResponse } from "@pagination-entity";
import {
  buildOrderBy,
  buildWhere,
  eqFilter,
  runBatchOperationWithCount,
} from "@generics-db";
import { taxesTable } from "@schema";
import { getSelectTaxesPageAction } from "@tax-db";

const TAX_SORT_MAP = {
  name: taxesTable.name,
  createdAt: taxesTable.createdAt,
};

const TAX_FILTER_MAP = {
  countryCode: eqFilter(taxesTable.countryCode),
};

export const getTaxesPage = async (
  query?: unknown,
): Promise<Paginated<AdminTax>> => {
  const { page, pageSize, sortBy, sortOrder } = parseListQuery(
    ["name", "createdAt"],
    query,
  );
  const filters = (query ?? {}) as Record<string, string | undefined>;

  const where = buildWhere(TAX_FILTER_MAP, filters);
  const orderBy = buildOrderBy(TAX_SORT_MAP, sortBy, sortOrder);

  const [total, taxes] = await runBatchOperationWithCount(
    taxesTable,
    getSelectTaxesPageAction(page, pageSize, where, orderBy),
    where,
  );
  return toPaginatedResponse(taxes, { page, pageSize, total });
};
