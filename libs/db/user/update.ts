import { db } from "@db";
import { contextStore } from "@context-utils";
import { usersTable } from "@schema";
import { eq, sql } from "drizzle-orm";
import { InsertUser } from "@user-entity";

export const updateUser = async (
  userId: string,
  changes: Partial<InsertUser>,
): Promise<void> => {
  await (contextStore.context.transaction ?? db())
    .update(usersTable)
    .set(changes)
    .where(eq(usersTable.id, userId));
};

export const incrementUserVersion = async (userId: string): Promise<void> => {
  await (contextStore.context.transaction ?? db())
    .update(usersTable)
    .set({
      version: sql`version + 1`,
    })
    .where(eq(usersTable.id, userId));
};
