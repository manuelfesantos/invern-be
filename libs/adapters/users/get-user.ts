import { User } from "@entities/user/user-entity";
import { getDb } from "@adapters/db";
import { errors } from "@utils/error-handling/error-messages";

export const getUserByEmail = async (email: string) => {
  const db = getDb();
  return await db
    .prepare(`SELECT * FROM users WHERE email = '${email}'`)
    .first<User>();
};

export const getUserById = async (id: string) => {
  const db = getDb();
  const user = await db
    .prepare(`SELECT * FROM users WHERE id = '${id}'`)
    .first<User>();

  if (!user) {
    throw errors.USER_NOT_FOUND;
  }

  return user;
};
