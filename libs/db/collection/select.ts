import { db } from "@db";
import { eq } from "drizzle-orm";
import { collectionsTable } from "@schema";
import { Collection, CollectionDetails } from "@collection-entity";

export const selectCollections = async (): Promise<Collection[]> => {
  const collections = await db().query.collectionsTable.findMany({
    with: {
      images: {
        columns: {
          collectionId: false,
          productId: false,
        },
      },
    },
  });

  return collections.map((collection) => ({
    ...collection,
    images: undefined,
    image: collection.images,
  }));
};

export const selectCollectionByName = async (
  collectionName: string,
): Promise<CollectionDetails | undefined> => {
  return db().query.collectionsTable.findFirst({
    where: eq(collectionsTable.name, collectionName),
    with: {
      products: {
        columns: {
          collectionId: false,
          description: false,
        },
        with: {
          images: {
            limit: 1,
            columns: {
              collectionId: false,
              productId: false,
            },
          },
        },
      },
    },
  });
};

export const selectCollectionById = async (
  collectionId: string,
): Promise<CollectionDetails | undefined> => {
  return db().query.collectionsTable.findFirst({
    where: eq(collectionsTable.id, collectionId),
    with: {
      products: {
        with: {
          images: {
            limit: 1,
            columns: {
              collectionId: false,
              productId: false,
            },
          },
        },
      },
    },
  });
};
