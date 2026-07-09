import type { ShippingMethod } from "@shipping-entity";
import type { Paginated } from "@pagination-entity";
import { parseListQuery, toPaginatedResponse } from "@pagination-entity";
import {
  buildOrderBy,
  buildWhere,
  likeFilter,
  runBatchOperationWithCount,
} from "@generics-db";
import { shippingMethodsTable } from "@schema";
import { getSelectShippingMethodsPageAction } from "@shipping-db";

const SHIPPING_METHOD_SORT_MAP = {
  name: shippingMethodsTable.name,
  createdAt: shippingMethodsTable.createdAt,
};

const SHIPPING_METHOD_FILTER_MAP = {
  name: likeFilter(shippingMethodsTable.name),
};

export const getShippingMethodsPage = async (
  query?: unknown,
): Promise<Paginated<ShippingMethod>> => {
  const { page, pageSize, sortBy, sortOrder } = parseListQuery(
    ["name", "createdAt"],
    query,
  );
  const filters = (query ?? {}) as Record<string, string | undefined>;

  const where = buildWhere(SHIPPING_METHOD_FILTER_MAP, filters);
  const orderBy = buildOrderBy(SHIPPING_METHOD_SORT_MAP, sortBy, sortOrder);

  const [total, methods] = await runBatchOperationWithCount(
    shippingMethodsTable,
    getSelectShippingMethodsPageAction(page, pageSize, where, orderBy),
    where,
  );
  return toPaginatedResponse(methods, { page, pageSize, total });
};
