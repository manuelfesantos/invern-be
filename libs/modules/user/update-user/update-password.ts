import { UserDTO, userToUserDTO } from "@entities/user/user-entity";
import { getUserById } from "@adapters/user/get-user";
import { hash } from "../../../utils/crypto";
import { updateUser } from "@adapters/user/update-user";

export const updatePassword = async (
  id: string,
  password: string,
): Promise<UserDTO> => {
  const user = await getUserById(id);

  const passwordHash = await hashPassword(password, id);

  await updateUser(id, `password = ${passwordHash}`);

  return userToUserDTO(user);
};

const hashPassword = async (password: string, id: string) => {
  return await hash(password, id);
};
