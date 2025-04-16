import { selectUserById, updateUser } from "@user-db";
import { hashPassword } from "@crypto-utils";
import { contextStore } from "@context-utils";
import { updatePasswordBodySchema } from "../types/update-user";
import { errors } from "@error-handling-utils";
import { toUserDTO, UserDTO } from "@user-entity";
import { withTransaction } from "@db";

export const updateUserPassword = withTransaction(
  async (body: unknown): Promise<UserDTO> => {
    const { userId } = contextStore.context;

    if (!userId) {
      throw new Error("not logged in");
    }

    const { currentPassword, newPassword } =
      updatePasswordBodySchema.parse(body);

    const { password } = await selectUserById(userId);

    const hashedCurrentPassword = await hashPassword(currentPassword, userId);

    if (hashedCurrentPassword !== password) {
      throw errors.UNAUTHORIZED("current password is incorrect");
    }

    await updateUser(userId, { password: newPassword });

    const updatedUser = await selectUserById(userId);

    if (!updatedUser) {
      throw errors.USER_NOT_FOUND();
    }

    return toUserDTO(updatedUser);
  },
);
