import type { InsertCollection } from "@collection-entity";
import { collectionsTable } from "@schema";
import { db } from "@db";
import { eq } from "drizzle-orm";
import { actionBuilder } from "@generics-db";

export const updateCollectionQuery = (
  collectionId: string,
  changes: Partial<InsertCollection>,
) =>
  db()
    .update(collectionsTable)
    .set(changes)
    .where(eq(collectionsTable.id, collectionId));

export const getUpdateCollectionAction = actionBuilder(updateCollectionQuery);
