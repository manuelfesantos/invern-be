import { InsertCollection } from "@collection-entity";
import { collectionsTable } from "@schema";
import { db } from "@db";
import { contextStore } from "@context-utils";
import { eq } from "drizzle-orm";

export const updateCollection = async (
  collectionId: string,
  changes: Partial<InsertCollection>,
): Promise<void> => {
  await (contextStore.context.transaction ?? db())
    .update(collectionsTable)
    .set(changes)
    .where(eq(collectionsTable.id, collectionId));
};
