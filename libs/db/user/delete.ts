import { db } from "@db";
import { usersTable } from "@schema";
import { eq } from "drizzle-orm";

export const deleteUser = async (userId: string): Promise<void> => {
  await db().delete(usersTable).where(eq(usersTable.userId, userId));
};
