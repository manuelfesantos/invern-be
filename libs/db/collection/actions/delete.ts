import { collectionsTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { actionBuilder } from "@generics-db";

export const deleteCollectionQuery = async (collectionId: string) =>
  db().delete(collectionsTable).where(eq(collectionsTable.id, collectionId));

export const getDeleteCollectionAction = actionBuilder(deleteCollectionQuery);
