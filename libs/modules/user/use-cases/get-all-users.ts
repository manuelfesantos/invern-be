import type { BaseUser } from "@user-entity";
import type { Paginated } from "@pagination-entity";
import { paginationQuerySchema, toPaginatedResponse } from "@pagination-entity";
import { selectAllUsersOperation } from "./operations/select-all-users";

export const getAllUsers = async (
  pagination?: unknown,
): Promise<Paginated<BaseUser>> => {
  const { page, pageSize } = paginationQuerySchema.parse(pagination ?? {});
  const { count, users } = await selectAllUsersOperation(page, pageSize);
  return toPaginatedResponse(users, { page, pageSize, total: count });
};
