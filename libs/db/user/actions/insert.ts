import { actionBuilder, Result } from "@generics-db";
import { BaseUser, baseUserSchema, InsertUser } from "@user-entity";
import { db } from "@db";
import { usersTable } from "@schema";
import { hashPassword } from "@crypto-utils";

const insertUserQuery = (user: InsertUser) => {
  return db().insert(usersTable).values(user).returning();
};

const FIRST_INDEX = 0;

const mapUserFromInsertResult = (
  result: Result<typeof insertUserQuery>,
): BaseUser => {
  const firstResult = result[FIRST_INDEX];

  return baseUserSchema.parse(firstResult);
};

const preProcessUserInsert = async (
  user: InsertUser,
): Promise<[user: InsertUser]> => {
  if (user.password) {
    user.password = await hashPassword(user.password, user.id);
  }
  return [user];
};

export const getInsertUserAction = actionBuilder(
  insertUserQuery,
  mapUserFromInsertResult,
  preProcessUserInsert,
);
