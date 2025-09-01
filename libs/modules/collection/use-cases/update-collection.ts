import type { CollectionDetails} from "@collection-entity";
import { insertCollectionSchema } from "@collection-entity";
import { updateCollectionOperation } from "./operations/update-collection";

export const updateCollection = async (
  id: string,
  body: unknown,
): Promise<CollectionDetails | undefined> => {
  const insertCollection = insertCollectionSchema.parse(body);
  return await updateCollectionOperation(id, insertCollection);
};
