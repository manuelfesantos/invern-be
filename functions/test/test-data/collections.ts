import { db } from "@db";
import { collectionsTable } from "@schema";
import { InsertCollection } from "@collection-entity";
import { getRandomUUID } from "@crypto-utils";

const getCollectionsList = (): InsertCollection[] => [
  {
    name: "Erosion",
    description:
      "The nature of clay will speak of the continual erosion and weathering of the land we live on, of the traces made by the passage of humans across the surface of our planet and of the tension between a container and its contents.",
  },
  {
    name: "Midden",
    description:
      "Skye’s landscape undergoes fundamental natural changes as a result of climatic and geological processes. Changes made by human activities such as settlement and agriculture are scratched on its surface. Skye’s landscape undergoes fundamental natural changes as a result of climatic and geological processes. Changes made by human activities such as settlement and agriculture are scratched on its surface.",
  },
  {
    name: "Contour",
    description:
      "My contour collection grows from a feeling of connection to the land and the effect of people upon its surface. The forms of the land are bounded by fencing and dykes, crossed by paths and water courses, which can delineate, separate and unify.",
  },
];

export const insertCollections = async (): Promise<
  { collectionId: string; name: string }[]
> => {
  const collectionsList = getCollectionsList();
  return db()
    .insert(collectionsTable)
    .values(collectionsList.map((c) => ({ ...c, id: getRandomUUID() })))
    .returning({
      collectionId: collectionsTable.id,
      name: collectionsTable.name,
    });
};
