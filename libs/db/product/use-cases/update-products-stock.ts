import { ProductIdAndQuantity } from "@product-entity";
import { inArray, sql } from "drizzle-orm";
import { db } from "@db";
import { contextStore } from "@context-utils";
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

  logger().info("reserving products", LoggerUseCaseEnum.RESERVE_PRODUCTS, {
    products,
  });

  const updatedProducts = await (
    contextStore.context.transaction ??
    contextStore.context.transaction ??
    contextStore.context.transaction ??
    db()
  )
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

  logger().info("products reserved", LoggerUseCaseEnum.RESERVE_PRODUCTS, {
    products: updatedProducts,
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

  logger().info("releasing products", LoggerUseCaseEnum.RELEASE_PRODUCTS, {
    products,
  });

  return (
    contextStore.context.transaction ??
    contextStore.context.transaction ??
    contextStore.context.transaction ??
    db()
  )
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
