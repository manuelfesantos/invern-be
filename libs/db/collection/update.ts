import { InsertCollection } from "@collection-entity";
import { collectionsTable } from "@schema";
import { db } from "@db";
import { eq } from "drizzle-orm";

export const updateCollection = async (
  collectionId: string,
  changes: Partial<InsertCollection>,
): Promise<void> => {
  await db()
    .update(collectionsTable)
    .set(changes)
    .where(eq(collectionsTable.id, collectionId));
};
