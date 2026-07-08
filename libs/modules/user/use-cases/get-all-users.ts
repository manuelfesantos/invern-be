import type { BaseUser } from "@user-entity";
import type { Paginated } from "@pagination-entity";
import { parseListQuery, toPaginatedResponse } from "@pagination-entity";
import {
  boolFilter,
  buildOrderBy,
  buildWhere,
  eqFilter,
  likeFilter,
} from "@generics-db";
import { usersTable } from "@schema";
import { selectAllUsersOperation } from "./operations/select-all-users";

/** Admin-list sortable fields → their columns. */
const USER_SORT_MAP = {
  createdAt: usersTable.createdAt,
  email: usersTable.email,
};

/** Admin-list filter keys → bound conditions. */
const USER_FILTER_MAP = {
  email: likeFilter(usersTable.email),
  role: eqFilter(usersTable.role),
  isValidated: boolFilter(usersTable.isValidated),
};

export const getAllUsers = async (
  query?: unknown,
): Promise<Paginated<BaseUser>> => {
  const { page, pageSize, sortBy, sortOrder } = parseListQuery(
    ["createdAt", "email"],
    query,
  );
  const filters = (query ?? {}) as Record<string, string | undefined>;

  const where = buildWhere(USER_FILTER_MAP, filters);
  const orderBy = buildOrderBy(USER_SORT_MAP, sortBy, sortOrder);

  const { count, users } = await selectAllUsersOperation(
    page,
    pageSize,
    where,
    orderBy,
  );
  return toPaginatedResponse(users, { page, pageSize, total: count });
};
