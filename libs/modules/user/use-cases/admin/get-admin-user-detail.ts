import type { AdminUser } from "@user-entity";
import { toAdminUser } from "@user-entity";
import { getSelectUserByIdAction } from "@user-db";
import { errors } from "@error-handling-utils";

/**
 * Admin user detail via the safe projection — role is included, the password
 * hash and google id are never returned (`toAdminUser` strips them).
 */
export const getAdminUserDetail = async (
  userId: string,
): Promise<AdminUser> => {
  const user = await getSelectUserByIdAction(userId).run();
  if (!user) {
    throw errors.USER_NOT_FOUND();
  }
  return toAdminUser(user);
};
