import { ProductIdAndQuantity } from "@product-entity";
import { inArray, sql } from "drizzle-orm";
import { db } from "@db";
import { productsTable } from "@schema";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";

export const decreaseProductsStock = async (
  products: ProductIdAndQuantity[],
): Promise<{ stock: number; id: string }[]> => {
  const setQuery = sql`CASE ${products
    .map(
      (product) =>
        sql`WHEN id = ${product.id} THEN stock - ${product.quantity}`,
    )
    .reduce((acc, curr) => sql`${acc} ${curr}`)} ELSE stock END`;

  logger().info("reserving products", {
    useCase: LoggerUseCaseEnum.RESERVE_PRODUCTS,
    data: {
      products,
    },
  });

  const updatedProducts = await db()
    .update(productsTable)
    .set({
      stock: setQuery,
    })
    .where(
      inArray(
        productsTable.id,
        products.map((p) => p.id),
      ),
    )
    .returning({
      stock: productsTable.stock,
      id: productsTable.id,
    });

  logger().info("products reserved", {
    useCase: LoggerUseCaseEnum.RESERVE_PRODUCTS,
    data: {
      products: updatedProducts,
    },
  });

  return updatedProducts;
};

export const increaseProductsStock = async (
  products: ProductIdAndQuantity[],
): Promise<{ stock: number; id: string }[]> => {
  if (!products.length) return [];
  const setQuery = sql`CASE ${products
    .map(
      (product) =>
        sql`WHEN id = ${product.id} THEN stock + ${product.quantity}`,
    )
    .reduce((acc, curr) => sql`${acc} ${curr}`)} ELSE stock END`;

  logger().info("releasing products", {
    useCase: LoggerUseCaseEnum.RELEASE_PRODUCTS,
    data: {
      products,
    },
  });

  return db()
    .update(productsTable)
    .set({
      stock: setQuery,
    })
    .where(
      inArray(
        productsTable.id,
        products.map((p) => p.id),
      ),
    )
    .returning({
      stock: productsTable.stock,
      id: productsTable.id,
    });
};
