import { getUserById } from "@user-db";
import { UserDTO, userToUserDTO } from "@user-entity";
import { errors } from "@error-handling-utils";
import { contextStore } from "@context-utils";

export const getUser = async (): Promise<UserDTO> => {
  const { userId } = contextStore.context;

  if (!userId) {
    throw errors.UNAUTHORIZED();
  }
  const user = await getUserById(userId);
  return userToUserDTO(user);
};
