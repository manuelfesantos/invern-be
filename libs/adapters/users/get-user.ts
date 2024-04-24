import { User, UserDTO } from "@entities/user/user-entity";
import { getDb } from "@adapters/db";

export const getUser = async (email: string) => {
  const db = getDb();
  return await db
    .prepare(`SELECT * FROM users WHERE email = '${email}'`)
    .first<User>();
};
