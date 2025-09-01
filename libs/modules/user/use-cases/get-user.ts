import { getSelectUserByIdAction } from "@user-db";
import type { UserDTO, User } from "@user-entity";
import { toUserDTO } from "@user-entity";
import { errors } from "@error-handling-utils";
import { contextStore } from "@context-utils";
import { logCredentials } from "@logger-utils";

export async function getUser(userId?: string): Promise<UserDTO>;
export async function getUser(userId: string, shouldDTO: false): Promise<User>;
export async function getUser(
  userId?: string,
  shouldDTO = true,
): Promise<UserDTO> {
  if (!userId) {
    userId = contextStore.context.userId;
  }

  if (!userId) {
    throw errors.UNAUTHORIZED();
  }
  const user = await getSelectUserByIdAction(userId).run();
  if (!user) {
    throw errors.USER_NOT_FOUND();
  }

  logCredentials(user.cart?.id, user.id);
  return shouldDTO ? toUserDTO(user) : user;
}
