import type { Cart } from "@cart-entity";
import type { Paginated } from "@pagination-entity";
import { parseListQuery, toPaginatedResponse } from "@pagination-entity";
import { boolFilter, buildOrderBy, buildWhere } from "@generics-db";
import { cartsTable } from "@schema";
import { selectAllCartsOperation } from "./operations/select-all-carts";

const CART_SORT_MAP = {
  createdAt: cartsTable.createdAt,
  lastModifiedAt: cartsTable.lastModifiedAt,
};

const CART_FILTER_MAP = {
  isLoggedIn: boolFilter(cartsTable.isLoggedIn),
};

export const getAllCarts = async (
  query?: unknown,
): Promise<Paginated<Cart>> => {
  const { page, pageSize, sortBy, sortOrder } = parseListQuery(
    ["createdAt", "lastModifiedAt"],
    query,
  );
  const filters = (query ?? {}) as Record<string, string | undefined>;

  const where = buildWhere(CART_FILTER_MAP, filters);
  const orderBy = buildOrderBy(CART_SORT_MAP, sortBy, sortOrder);

  const { count, carts } = await selectAllCartsOperation(
    page,
    pageSize,
    where,
    orderBy,
  );
  return toPaginatedResponse(carts, { page, pageSize, total: count });
};
