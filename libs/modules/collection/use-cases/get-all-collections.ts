import { selectCollections } from "@collection-db";
import { Collection } from "@collection-entity";

export const getAllCollections = async (): Promise<Collection[]> => {
  return await selectCollections();
};
