import { db } from "@db";
import { contextStore } from "@context-utils";
import { eq, inArray, like, or } from "drizzle-orm";
import { productsTable } from "@schema";
import { Product, ProductDetails } from "@product-entity";

export const getProducts = async (): Promise<Product[]> => {
  return (
    contextStore.context.transaction ?? db()
  ).query.productsTable.findMany({
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

export const getProductById = async (
  productId: string,
): Promise<ProductDetails | undefined> => {
  return (
    contextStore.context.transaction ?? db()
  ).query.productsTable.findFirst({
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
};

export const getProductsByCollectionId = async (
  collectionId: string,
): Promise<Product[]> => {
  return (
    contextStore.context.transaction ?? db()
  ).query.productsTable.findMany({
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
  return (
    contextStore.context.transaction ?? db()
  ).query.productsTable.findMany({
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
};

export const getProductsByProductIds = async (
  productIds: string[],
): Promise<Product[]> => {
  return (
    contextStore.context.transaction ?? db()
  ).query.productsTable.findMany({
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
};
