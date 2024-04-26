import { UserDTO, userToUserDTO } from "@entities/user/user-entity";
import { getUserById } from "@adapters/users/get-user";
import { getDb } from "@adapters/db";
import { hash } from "@utils/crypto";

export const updatePassword = async (
  id: string,
  password: string,
): Promise<UserDTO> => {
  const user = await getUserById(id);

  const passwordHash = await hashPassword(password, id);

  await runQuery(id, passwordHash);

  return userToUserDTO(user);
};

const runQuery = async (id: string, password: string) => {
  const db = getDb();
  await db
    .prepare("UPDATE users SET password = ? WHERE id = ?")
    .bind(password, id)
    .run();
};

const hashPassword = async (password: string, id: string) => {
  return await hash(password, id);
};
