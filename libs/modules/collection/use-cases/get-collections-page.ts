import type { Collection } from "@collection-entity";
import type { Paginated } from "@pagination-entity";
import { parseListQuery, toPaginatedResponse } from "@pagination-entity";
import {
  buildOrderBy,
  buildWhere,
  likeFilter,
  runBatchOperationWithCount,
} from "@generics-db";
import { collectionsTable } from "@schema";
import { getSelectCollectionsPageAction } from "@collection-db";

const COLLECTION_SORT_MAP = {
  name: collectionsTable.name,
  createdAt: collectionsTable.createdAt,
};

const COLLECTION_FILTER_MAP = {
  name: likeFilter(collectionsTable.name),
};

export const getCollectionsPage = async (
  query?: unknown,
): Promise<Paginated<Collection>> => {
  const { page, pageSize, sortBy, sortOrder } = parseListQuery(
    ["name", "createdAt"],
    query,
  );
  const filters = (query ?? {}) as Record<string, string | undefined>;

  const where = buildWhere(COLLECTION_FILTER_MAP, filters);
  const orderBy = buildOrderBy(COLLECTION_SORT_MAP, sortBy, sortOrder);

  const [total, collections] = await runBatchOperationWithCount(
    collectionsTable,
    getSelectCollectionsPageAction(page, pageSize, where, orderBy),
    where,
  );
  return toPaginatedResponse(collections, { page, pageSize, total });
};
