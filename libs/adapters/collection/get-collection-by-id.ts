import { prepareStatement } from "@db-adapter";
import { Collection } from "@collection-entity";
import { errors } from "@error-handling-utils";

export const getCollectionById = async (collectionId: string) => {
  const collection = await prepareStatement(
    `SELECT collectionId, collectionName, description FROM collections WHERE collectionId = '${collectionId}'`,
  ).first<Collection>();
  if (!collection) {
    throw errors.COLLECTION_NOT_FOUND();
  }
  return collection;
};
