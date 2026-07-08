import type { Collection } from "@collection-entity";
import type { Paginated } from "@pagination-entity";
import { paginationQuerySchema, toPaginatedResponse } from "@pagination-entity";
import { runBatchOperationWithCount } from "@generics-db";
import { collectionsTable } from "@schema";
import { getSelectCollectionsPageAction } from "@collection-db";

export const getCollectionsPage = async (
  pagination?: unknown,
): Promise<Paginated<Collection>> => {
  const { page, pageSize } = paginationQuerySchema.parse(pagination ?? {});
  const [total, collections] = await runBatchOperationWithCount(
    collectionsTable,
    getSelectCollectionsPageAction(page, pageSize),
  );
  return toPaginatedResponse(collections, { page, pageSize, total });
};
