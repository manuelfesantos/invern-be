import { BaseUser } from "@user-entity";
import { runBatchOperationWithCount } from "@generics-db";
import { usersTable } from "@schema";
import { getSelectAllUsersAction } from "@user-db";

export const selectAllUsersOperation = async (
  page: number,
  pageSize: number,
): Promise<{ count: number; users: BaseUser[] }> => {
  const [count, users] = await runBatchOperationWithCount(
    usersTable,
    getSelectAllUsersAction(page, pageSize),
  );
  return {
    count,
    users,
  };
};
