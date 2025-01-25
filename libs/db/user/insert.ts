import { InsertUser } from "@user-entity";
import { getRandomUUID, hashPassword } from "@crypto-utils";
import { db } from "@db";
import { contextStore } from "@context-utils";
import { usersTable } from "@schema";

export const insertUser = async (
  user: InsertUser,
): Promise<
  {
    userId: string;
  }[]
> => {
  const insertUser = {
    ...user,
    id: getRandomUUID(),
  };

  insertUser.password = await hashPassword(insertUser.password, insertUser.id);

  return (contextStore.context.transaction ?? db())
    .insert(usersTable)
    .values(insertUser)
    .returning({
      userId: usersTable.id,
    });
};
