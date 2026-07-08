import type { Product } from "@product-entity";
import type { Paginated } from "@pagination-entity";
import { parseListQuery, toPaginatedResponse } from "@pagination-entity";
import {
  buildOrderBy,
  buildWhere,
  eqFilter,
  likeFilter,
  maxNumberFilter,
  runBatchOperationWithCount,
} from "@generics-db";
import { productsTable } from "@schema";
import { getSelectProductsPageAction } from "@product-db";

/** Admin-list sortable fields → their columns. */
const PRODUCT_SORT_MAP = {
  name: productsTable.name,
  stock: productsTable.stock,
  priceInCents: productsTable.priceInCents,
  createdAt: productsTable.createdAt,
};

/** Admin-list filter keys → bound conditions. */
const PRODUCT_FILTER_MAP = {
  collectionId: eqFilter(productsTable.collectionId),
  name: likeFilter(productsTable.name),
  maxStock: maxNumberFilter(productsTable.stock),
};

/**
 * Admin product list — paginated, sortable and filterable, and NON-extended
 * (no price/tax extension), distinct from the public `getAllProducts` search
 * path. `total` reflects the applied filter.
 */
export const getProductsPage = async (
  query?: unknown,
): Promise<Paginated<Product>> => {
  const { page, pageSize, sortBy, sortOrder } = parseListQuery(
    ["name", "stock", "priceInCents", "createdAt"],
    query,
  );
  const filters = (query ?? {}) as Record<string, string | undefined>;

  const where = buildWhere(PRODUCT_FILTER_MAP, filters);
  const orderBy = buildOrderBy(PRODUCT_SORT_MAP, sortBy, sortOrder);

  const [total, products] = await runBatchOperationWithCount(
    productsTable,
    getSelectProductsPageAction(page, pageSize, where, orderBy),
    where,
  );
  return toPaginatedResponse(products, { page, pageSize, total });
};
