import * as z from "zod";
import type { AdminUser } from "@user-entity";
import {
  getSelectAdminCountAction,
  getSelectUserByIdAction,
  getUpdateUserAction,
} from "@user-db";
import { deleteAuthSecret } from "@kv-adapter";
import { errors } from "@error-handling-utils";
import { getAdminUserDetail } from "./get-admin-user-detail";

// Whitelisted admin-editable fields. Everything else (email, password, cart, …)
// is out of scope here — only role/validation/disabled state.
const updateUserAdminSchema = z.object({
  role: z.enum(["ADMIN", "USER"]).optional(),
  isValidated: z.boolean().optional(),
  disabled: z.boolean().optional(),
});

const LAST_ADMIN = 1;

export const updateUserAdmin = async (
  userId: string,
  body: unknown,
): Promise<AdminUser> => {
  const changes = updateUserAdminSchema.parse(body);

  const existing = await getSelectUserByIdAction(userId).run();
  if (!existing) {
    throw errors.USER_NOT_FOUND();
  }

  // Last-admin guard: demoting or disabling the final admin locks everyone out
  // of the backoffice with no UI to recover.
  const losingAdmin =
    existing.role === "ADMIN" &&
    (changes.role === "USER" || changes.disabled === true);
  if (losingAdmin) {
    const admins = await getSelectAdminCountAction().run();
    if (admins <= LAST_ADMIN) {
      throw errors.CANNOT_REMOVE_LAST_ADMIN();
    }
  }

  if (Object.keys(changes).length) {
    await getUpdateUserAction(userId, changes).run();
  }

  // A role change or a disable must invalidate the target's session — revoke the
  // refresh secret; their access token expires within its (≤15min) TTL.
  const roleChanged =
    changes.role !== undefined && changes.role !== existing.role;
  const disabling = changes.disabled === true && !existing.disabled;
  if (roleChanged || disabling) {
    await deleteAuthSecret(userId);
  }

  return getAdminUserDetail(userId);
};
