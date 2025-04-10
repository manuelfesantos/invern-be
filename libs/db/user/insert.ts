import { BaseUser, InsertUser } from "@user-entity";
import { getRandomUUID, hashPassword } from "@crypto-utils";
import { db } from "@db";
import { usersTable } from "@schema";

export const insertUser = async (user: InsertUser): Promise<BaseUser[]> => {
  const insertUser = {
    ...user,
    id: getRandomUUID(),
  };

  if (insertUser.password) {
    insertUser.password = await hashPassword(
      insertUser.password,
      insertUser.id,
    );
  }

  return db().insert(usersTable).values(insertUser).returning();
};
