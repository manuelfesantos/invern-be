import { updateUserBodySchema } from "./types/update-user";
import { updateEmail } from "./update-email";
import { updatePassword } from "./update-password";
import { updateName } from "./update-name";
import { errors } from "@error-handling-utils";
import { getUserById, incrementUserVersion } from "@user-db";
import { contextStore } from "@context-utils";
import { transaction } from "@db";
import { UserDTO, userDTOSchema } from "@user-entity";

export const updateUser = async (body: unknown): Promise<UserDTO> => {
  const { userId } = contextStore.context;

  if (!userId) {
    throw errors.UNAUTHORIZED("not logged in");
  }
  const updateUserBody = updateUserBodySchema.parse(body);

  return await transaction<UserDTO>(async () => {
    if (updateUserBody.email) {
      await updateEmail(userId, updateUserBody.email);
    }
    if (updateUserBody.password) {
      await updatePassword(userId, updateUserBody.password);
    }
    if (updateUserBody.firstName || updateUserBody.lastName) {
      await updateName(
        userId,
        updateUserBody.firstName,
        updateUserBody.lastName,
      );
    }
    await incrementUserVersion(userId);

    const updatedUser = await getUserById(userId);
    return userDTOSchema.parse(updatedUser);
  });
};
