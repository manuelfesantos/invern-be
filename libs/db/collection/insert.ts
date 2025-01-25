import { collectionsTable } from "@schema";
import { getRandomUUID } from "@crypto-utils";
import { db } from "@db";
import { contextStore } from "@context-utils";
import { InsertCollection } from "@collection-entity";

export const insertCollection = async (
  collection: InsertCollection,
): Promise<{ collectionId: string }[]> => {
  const insertCollection = {
    ...collection,
    id: getRandomUUID(),
  };
  return (contextStore.context.transaction ?? db())
    .insert(collectionsTable)
    .values(insertCollection)
    .returning({
      collectionId: collectionsTable.id,
    });
};
