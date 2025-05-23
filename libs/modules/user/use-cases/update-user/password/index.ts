import { getSelectUserByIdAction, getUpdateUserAction } from "@user-db";
import { hashPassword } from "@crypto-utils";
import { contextStore } from "@context-utils";
import { updatePasswordBodySchema } from "../types/update-user";
import { errors } from "@error-handling-utils";
import { toUserDTO, UserDTO } from "@user-entity";

export const updateUserPassword = async (body: unknown): Promise<UserDTO> => {
  const { userId } = contextStore.context;

  if (!userId) {
    throw new Error("not logged in");
  }

  const { currentPassword, newPassword } = updatePasswordBodySchema.parse(body);

  const user = await getSelectUserByIdAction(userId).run();

  if (!user) {
    throw errors.USER_NOT_FOUND();
  }
  const { password } = user;

  const hashedCurrentPassword = await hashPassword(currentPassword, userId);

  if (hashedCurrentPassword !== password) {
    throw errors.UNAUTHORIZED("current password is incorrect");
  }

  await getUpdateUserAction(userId, {
    password: await hashPassword(newPassword, userId),
  }).run();

  const updatedUser = await getSelectUserByIdAction(userId).run();

  if (!updatedUser) {
    throw errors.USER_NOT_FOUND();
  }

  return toUserDTO(updatedUser);
};
