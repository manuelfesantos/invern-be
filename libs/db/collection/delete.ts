import { collectionsTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";

export const deleteCollection = async (collectionId: string): Promise<void> => {
  await db()
    .delete(collectionsTable)
    .where(eq(collectionsTable.collectionId, collectionId));
};
