import type { SQL } from "drizzle-orm";
import type { BaseUser } from "@user-entity";
import { runBatchOperationWithCount } from "@generics-db";
import { usersTable } from "@schema";
import { getSelectAllUsersAction } from "@user-db";

export const selectAllUsersOperation = async (
  page: number,
  pageSize: number,
  where?: SQL,
  orderBy?: SQL[],
): Promise<{ count: number; users: BaseUser[] }> => {
  const [count, users] = await runBatchOperationWithCount(
    usersTable,
    getSelectAllUsersAction(page, pageSize, where, orderBy),
    where,
  );
  return {
    count,
    users,
  };
};
