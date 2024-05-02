import { prepareStatement } from "@db-adapter";
import { Collection } from "@collection-entity";

export const getCollections = async () => {
  return await prepareStatement(
    `SELECT collectionId, collectionName FROM collections`,
  ).all<Collection>();
};
