import { db } from "@db";
import { eq } from "drizzle-orm";
import { collectionsTable } from "@schema";
import { Collection, CollectionDetails } from "@collection-entity";

export const getCollections = async (): Promise<Collection[]> => {
  return db().query.collectionsTable.findMany({
    with: {
      images: {
        columns: {
          collectionId: false,
          productId: false,
        },
      },
    },
  });
};

export const getCollectionByName = async (
  collectionName: string,
): Promise<CollectionDetails | undefined> => {
  return db().query.collectionsTable.findFirst({
    where: eq(collectionsTable.collectionName, collectionName),
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

export const getCollectionById = async (
  collectionId: string,
): Promise<CollectionDetails | undefined> => {
  return db().query.collectionsTable.findFirst({
    where: eq(collectionsTable.collectionId, collectionId),
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
