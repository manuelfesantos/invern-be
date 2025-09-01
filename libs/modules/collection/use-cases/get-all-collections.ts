import { getSelectCollectionsAction } from "@collection-db";
import type { Collection } from "@collection-entity";

export const getAllCollections = async (): Promise<Collection[]> => {
  return await getSelectCollectionsAction().run();
};
