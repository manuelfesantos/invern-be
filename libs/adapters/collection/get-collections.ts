import { prepareStatement } from "@db-utils";
import { Collection, collectionSchema } from "@collection-entity";

export const getCollections = async (): Promise<Collection[]> => {
  const { results } = await prepareStatement(
    `SELECT collections.collectionId, collectionName, url AS imageUrl, alt AS imageAlt FROM collections
            JOIN images ON collections.collectionId = images.collectionId`,
  ).all();
  return getcollectionsFromResults(results);
};

const getcollectionsFromResults = (
  results: Record<string, unknown>[],
): Collection[] => {
  return results.map(({ collectionId, collectionName, imageUrl, imageAlt }) =>
    collectionSchema.parse({
      collectionId,
      collectionName,
      collectionImage: {
        imageUrl,
        imageAlt,
      },
    }),
  );
};
