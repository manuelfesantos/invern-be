import type { CollectionDetails, InsertCollection } from "@collection-entity";
import { runBatchOperation } from "@generics-db";
import {
  getSelectCollectionByIdAction,
  getUpdateCollectionAction,
} from "@collection-db";

export const updateCollectionOperation = async (
  id: string,
  collection: Partial<InsertCollection>,
): Promise<CollectionDetails | undefined> => {
  const [, collectionDetails] = await runBatchOperation(
    getUpdateCollectionAction(id, collection),
    getSelectCollectionByIdAction(id),
  );
  return collectionDetails;
};
