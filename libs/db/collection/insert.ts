import { collectionsTable } from "@schema";
import { getRandomUUID } from "@crypto-utils";
import { db } from "@db";
import { InsertCollection } from "@collection-entity";

export const insertCollection = async (
  collection: InsertCollection,
): Promise<{ collectionId: string }[]> => {
  const insertCollection = {
    ...collection,
    collectionId: getRandomUUID(),
  };
  return db().insert(collectionsTable).values(insertCollection).returning({
    collectionId: collectionsTable.collectionId,
  });
};
