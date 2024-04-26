import { User, UserDTO, userToUserDTO } from "@entities/user/user-entity";
import { getUserById } from "@adapters/users/get-user";
import { getDb } from "@adapters/db";

export const updateEmail = async (
  id: string,
  email: string,
): Promise<UserDTO> => {
  const user = await getUserById(id);

  await runQuery(id, email);

  return userToUserDTO(mergeUser(user, email));
};

const runQuery = async (id: string, email: string) => {
  const db = getDb();
  await db
    .prepare("UPDATE users SET email = ? WHERE id = ?")
    .bind(email, id)
    .run();
};

const mergeUser = (user: User, email: string) => ({
  ...user,
  email,
});
