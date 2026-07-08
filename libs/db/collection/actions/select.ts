import type { Collection } from "@collection-entity";
import { db } from "@db";
import type { Result } from "@generics-db";
import { actionBuilder } from "@generics-db";
import type { SQL } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { collectionsTable } from "@schema";
import { DEFAULT_PAGE } from "@number-utils";

const collectionImagesWith = {
  images: {
    columns: {
      collectionId: false,
      productId: false,
    },
  },
} as const;

const selectAllCollectionsQuery = () =>
  db().query.collectionsTable.findMany({ with: collectionImagesWith });

const selectCollectionsPageQuery = (
  page: number,
  pageSize: number,
  where?: SQL,
  orderBy?: SQL[],
) =>
  db().query.collectionsTable.findMany({
    with: collectionImagesWith,
    ...(where && { where }),
    ...(orderBy && { orderBy }),
    limit: pageSize,
    offset: (page - DEFAULT_PAGE) * pageSize,
  });

const mapCollectionsFromSelectAllQueryResult = (
  queryResult: Result<typeof selectAllCollectionsQuery>,
): Collection[] =>
  queryResult.map((collection) => ({
    ...collection,
    images: undefined,
    image: collection.images,
  }));

const selectCollectionQuery = (selection: "id" | "name", value: string) =>
  db().query.collectionsTable.findFirst({
    where: eq(collectionsTable[selection], value),
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

const selectCollectionByNameQuery = (collectionName: string) =>
  selectCollectionQuery("name", collectionName);

const selectCollectionByIdQuery = (collectionId: string) =>
  selectCollectionQuery("id", collectionId);

export const getSelectCollectionsAction = actionBuilder(
  selectAllCollectionsQuery,
  mapCollectionsFromSelectAllQueryResult,
);

export const getSelectCollectionsPageAction = actionBuilder(
  selectCollectionsPageQuery,
  mapCollectionsFromSelectAllQueryResult,
);

export const getSelectCollectionByNameAction = actionBuilder(
  selectCollectionByNameQuery,
);

export const getSelectCollectionByIdAction = actionBuilder(
  selectCollectionByIdQuery,
);
