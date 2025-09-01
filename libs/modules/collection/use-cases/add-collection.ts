import type { CollectionDetails} from "@collection-entity";
import { insertCollectionSchema } from "@collection-entity";
import {
  getInsertCollectionAction,
  getSelectCollectionByIdAction,
} from "@collection-db";

export const addCollection = async (
  body: unknown,
): Promise<CollectionDetails> => {
  const collection = insertCollectionSchema.parse(body);
  const [{ collectionId }] = await getInsertCollectionAction(collection).run();

  if (!collectionId) {
    throw new Error("Failed to create collection");
  }

  const collectionDetails =
    await getSelectCollectionByIdAction(collectionId).run();

  if (!collectionDetails) {
    throw new Error("Failed to create collection");
  }

  return collectionDetails;
};
