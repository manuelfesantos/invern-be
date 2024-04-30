import { User, UserDTO, userToUserDTO } from "@entities/user/user-entity";
import { getUserById } from "@adapters/user/get-user";
import { updateUser } from "@adapters/user/update-user";

export const updateEmail = async (
  id: string,
  email: string,
): Promise<UserDTO> => {
  const user = await getUserById(id);

  await updateUser(id, `email = ${email}`);

  return userToUserDTO(mergeUser(user, email));
};

const mergeUser = (user: User, email: string) => ({
  ...user,
  email,
});
