import { collectionsTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { contextStore } from "@context-utils";

export const deleteCollection = async (collectionId: string): Promise<void> => {
  await (contextStore.context.transaction ?? db())
    .delete(collectionsTable)
    .where(eq(collectionsTable.id, collectionId));
};
