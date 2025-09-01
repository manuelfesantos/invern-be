import { collectionsTable } from "@schema";
import { getRandomUUID } from "@crypto-utils";
import { db } from "@db";
import type { InsertCollection } from "@collection-entity";
import { actionBuilder } from "@generics-db";

export const insertCollectionQuery = (collection: InsertCollection) => {
  const insertCollection = {
    ...collection,
    id: getRandomUUID(),
  };
  return db().insert(collectionsTable).values(insertCollection).returning({
    collectionId: collectionsTable.id,
  });
};

export const getInsertCollectionAction = actionBuilder(insertCollectionQuery);
