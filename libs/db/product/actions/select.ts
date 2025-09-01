import { db } from "@db";
import { eq, inArray, like, or } from "drizzle-orm";
import { productsTable } from "@schema";
import type { Result } from "@generics-db";
import { actionBuilder } from "@generics-db";

const selectProductsQuery = () => {
  return db().query.productsTable.findMany({
    columns: {
      description: false,
      collectionId: false,
    },
    with: {
      images: {
        limit: 1,
        columns: {
          productId: false,
          collectionId: false,
        },
      },
    },
  });
};

const selectProductStockByIdQuery = (productId: string) =>
  db().query.productsTable.findFirst({
    where: eq(productsTable.id, productId),
    columns: {
      stock: true,
    },
  });

const mapProductStockFromSelectByIdQueryResult = (
  result: Result<typeof selectProductStockByIdQuery>,
): number | undefined => {
  if (!result) {
    return undefined;
  }
  return result.stock;
};

const selectProductsByCollectionIdQuery = (collectionId: string) =>
  db().query.productsTable.findMany({
    where: eq(productsTable.collectionId, collectionId),
    with: {
      images: {
        limit: 1,
        columns: {
          productId: false,
          collectionId: false,
        },
      },
    },
  });

const selectProductsBySearchQuery = (search: string) =>
  db().query.productsTable.findMany({
    where: or(
      like(productsTable.description, `%${search}%`),
      like(productsTable.name, `%${search}%`),
    ),
    with: {
      images: {
        limit: 1,
        columns: {
          productId: false,
          collectionId: false,
        },
      },
    },
  });

const selectProductsByProductIdsQuery = (productIds: string[]) =>
  db().query.productsTable.findMany({
    where: inArray(productsTable.id, productIds),
    with: {
      images: {
        limit: 1,
        columns: {
          productId: false,
          collectionId: false,
        },
      },
    },
  });

const selectProductByIdQuery = (productId: string) =>
  db().query.productsTable.findFirst({
    where: eq(productsTable.id, productId),
    with: {
      images: {
        columns: {
          productId: false,
          collectionId: false,
        },
      },
    },
  });

export const getSelectProductsByProductIdsAction = actionBuilder(
  selectProductsByProductIdsQuery,
);

export const getSelectProductsAction = actionBuilder(selectProductsQuery);

export const getSelectProductStockByIdAction = actionBuilder(
  selectProductStockByIdQuery,
  mapProductStockFromSelectByIdQueryResult,
);

export const getSelectProductsByCollectionIdAction = actionBuilder(
  selectProductsByCollectionIdQuery,
);

export const getSelectProductsBySearchAction = actionBuilder(
  selectProductsBySearchQuery,
);

export const getSelectProductByIdAction = actionBuilder(selectProductByIdQuery);
