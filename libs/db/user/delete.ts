import { db } from "@db";
import { contextStore } from "@context-utils";
import { usersTable } from "@schema";
import { eq } from "drizzle-orm";

export const deleteUser = async (userId: string): Promise<void> => {
  await (contextStore.context.transaction ?? db())
    .delete(usersTable)
    .where(eq(usersTable.id, userId));
};
