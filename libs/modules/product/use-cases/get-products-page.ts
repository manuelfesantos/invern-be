import type { Product } from "@product-entity";
import type { Paginated } from "@pagination-entity";
import { paginationQuerySchema, toPaginatedResponse } from "@pagination-entity";
import { runBatchOperationWithCount } from "@generics-db";
import { productsTable } from "@schema";
import { getSelectProductsPageAction } from "@product-db";

/**
 * Admin product list — paginated and NON-extended (no price/tax extension),
 * distinct from the public `getAllProducts` search/extend path.
 */
export const getProductsPage = async (
  pagination?: unknown,
): Promise<Paginated<Product>> => {
  const { page, pageSize } = paginationQuerySchema.parse(pagination ?? {});
  const [total, products] = await runBatchOperationWithCount(
    productsTable,
    getSelectProductsPageAction(page, pageSize),
  );
  return toPaginatedResponse(products, { page, pageSize, total });
};
