import { getSelectUserByIdAction } from "@user-db";
import { UserDTO, toUserDTO, User } from "@user-entity";
import { errors } from "@error-handling-utils";
import { contextStore } from "@context-utils";

export async function getUser(userId?: string): Promise<UserDTO>;
export async function getUser(userId: string, shouldDTO: false): Promise<User>;
export async function getUser(
  userId?: string,
  shouldDTO: boolean = true,
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
  return shouldDTO ? toUserDTO(user) : user;
}
