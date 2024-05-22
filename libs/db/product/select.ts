import { db } from "@db";
import { eq, inArray, like, or } from "drizzle-orm";
import { productsTable } from "@schema";
import { Product, ProductDetails } from "@product-entity";

export const getProducts = async (
  productIds?: string[],
): Promise<Product[]> => {
  return db().query.productsTable.findMany({
    columns: {
      description: false,
      collectionId: false,
    },
    ...(productIds
      ? { where: inArray(productsTable.productId, productIds) }
      : {}),
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

export const getProductById = async (
  productId: string,
): Promise<ProductDetails | undefined> => {
  return db().query.productsTable.findFirst({
    where: eq(productsTable.productId, productId),
    with: {
      images: {
        columns: {
          productId: false,
          collectionId: false,
        },
      },
    },
  });
};

export const getProductsByCollectionId = async (
  collectionId: string,
): Promise<Product[]> => {
  return db().query.productsTable.findMany({
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
};

export const getProductsBySearch = async (
  search: string,
): Promise<Product[]> => {
  return db().query.productsTable.findMany({
    where: or(
      like(productsTable.description, search),
      like(productsTable.productName, search),
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
};
