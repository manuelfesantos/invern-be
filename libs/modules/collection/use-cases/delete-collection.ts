import { getDeleteCollectionAction } from "@collection-db";

export const deleteCollection = async (id: string): Promise<void> => {
  await getDeleteCollectionAction(id).run();
};
