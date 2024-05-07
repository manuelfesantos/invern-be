import { prepareStatement } from "@db-utils";
import { Collection } from "@collection-entity";
import { errors } from "@error-handling-utils";

export const getCollectionById = async (
  collectionId: string,
): Promise<Collection> => {
  const collection = await prepareStatement(
    `SELECT collections.collectionId, collectionName, description FROM collections 
            WHERE collections.collectionId = '${collectionId}'`,
  ).first<Collection>();
  if (!collection) {
    throw errors.COLLECTION_NOT_FOUND();
  }
  return collection;
};
