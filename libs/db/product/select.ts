import { db } from "@db";
import { eq, inArray, like, or } from "drizzle-orm";
import { productsTable } from "@schema";
import { Product, ProductDetails } from "@product-entity";

export const selectProducts = async (): Promise<Product[]> => {
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

export const selectProductById = async (
  productId: string,
): Promise<ProductDetails | undefined> => {
  return db().query.productsTable.findFirst({
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

export const selectProductStockById = async (
  productId: string,
): Promise<number | undefined> => {
  const product = await db().query.productsTable.findFirst({
    where: eq(productsTable.id, productId),
    columns: {
      stock: true,
    },
  });
  return product?.stock;
};

export const selectProductsByCollectionId = async (
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

export const selectProductsBySearch = async (
  search: string,
): Promise<Product[]> => {
  return db().query.productsTable.findMany({
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

export const selectProductsByProductIds = async (
  productIds: string[],
): Promise<Product[]> => {
  return db().query.productsTable.findMany({
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
