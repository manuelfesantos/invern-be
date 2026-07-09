import {
  getDeleteUserAction,
  getSelectAdminCountAction,
  getSelectUserByIdAction,
} from "@user-db";
import { getDeleteCartAction } from "@cart-db";
import { deleteAuthSecret } from "@kv-adapter";
import { errors } from "@error-handling-utils";

const LAST_ADMIN = 1;

/**
 * Admin hard-delete of a user (distinct from the public self-delete). Guarded so
 * the last admin can't be removed. Prefer disabling for problem accounts — this
 * destroys the user row (and cascades their orders). Revokes their session.
 */
export const adminDeleteUser = async (userId: string): Promise<void> => {
  const existing = await getSelectUserByIdAction(userId).run();
  if (!existing) {
    throw errors.USER_NOT_FOUND();
  }
  if (existing.role === "ADMIN") {
    const admins = await getSelectAdminCountAction().run();
    if (admins <= LAST_ADMIN) {
      throw errors.CANNOT_REMOVE_LAST_ADMIN();
    }
  }

  const { cartId } = await getDeleteUserAction(userId).run();
  if (cartId) {
    await getDeleteCartAction(cartId).run();
  }
  await deleteAuthSecret(userId);
};
