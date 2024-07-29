import { db } from "@db";
import { usersTable } from "@schema";
import { eq } from "drizzle-orm";
import { User } from "@user-entity";

const INCREMENT_ONE = 1;

export const updateUser = async (
  userId: string,
  changes: Partial<User>,
): Promise<void> => {
  await db()
    .update(usersTable)
    .set(changes)
    .where(eq(usersTable.userId, userId));
};

export const incrementUserVersion = async (
  userId: string,
  userVersion: number,
): Promise<void> => {
  await updateUser(userId, { version: userVersion + INCREMENT_ONE });
};
