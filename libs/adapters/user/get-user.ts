import { User } from "@entities/user/user-entity";
import { db } from "@adapters/db";
import { errors } from "../../utils/error-handling/error-messages";

export const getUserByEmail = async (email: string) => {
  return await db()
    .prepare(`SELECT * FROM users WHERE email = '${email}'`)
    .first<User>();
};

export const getUserById = async (id: string) => {
  const user = await db()
    .prepare(`SELECT * FROM users WHERE id = '${id}'`)
    .first<User>();

  if (!user) {
    throw errors.USER_NOT_FOUND;
  }

  return user;
};
