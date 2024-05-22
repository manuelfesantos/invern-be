import { db } from "@db";
import { usersTable } from "@schema";
import { eq } from "drizzle-orm";
import { InsertUser } from "@user-entity";

export const updateUser = async (
  userId: string,
  changes: Partial<InsertUser>,
): Promise<void> => {
  await db()
    .update(usersTable)
    .set(changes)
    .where(eq(usersTable.userId, userId));
};
