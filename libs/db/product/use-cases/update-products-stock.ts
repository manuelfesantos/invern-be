import { ProductIdAndQuantity } from "@product-entity";
import { inArray, sql } from "drizzle-orm";
import { db } from "@db";
import { productsTable } from "@schema";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";

export const decreaseProductsStock = async (
  products: ProductIdAndQuantity[],
): Promise<{ stock: number; productId: string }[]> => {
  const setQuery = sql`CASE ${products
    .map(
      (product) =>
        sql`WHEN productId = ${product.productId} THEN stock - ${product.quantity}`,
    )
    .reduce((acc, curr) => sql`${acc} ${curr}`)} ELSE stock END`;

  logger().info("reserving products", LoggerUseCaseEnum.RESERVE_PRODUCTS, {
    products,
  });

  const updatedProducts = await db()
    .update(productsTable)
    .set({
      stock: setQuery,
    })
    .where(
      inArray(
        productsTable.productId,
        products.map((p) => p.productId),
      ),
    )
    .returning({
      stock: productsTable.stock,
      productId: productsTable.productId,
    });

  logger().info("products reserved", LoggerUseCaseEnum.RESERVE_PRODUCTS, {
    products: updatedProducts,
  });

  return updatedProducts;
};

export const increaseProductsStock = async (
  products: ProductIdAndQuantity[],
): Promise<{ stock: number; productId: string }[]> => {
  if (!products.length) return [];
  const setQuery = sql`CASE ${products
    .map(
      (product) =>
        sql`WHEN productId = ${product.productId} THEN stock + ${product.quantity}`,
    )
    .reduce((acc, curr) => sql`${acc} ${curr}`)} ELSE stock END`;

  logger().info("releasing products", LoggerUseCaseEnum.RELEASE_PRODUCTS, {
    products,
  });

  return db()
    .update(productsTable)
    .set({
      stock: setQuery,
    })
    .where(
      inArray(
        productsTable.productId,
        products.map((p) => p.productId),
      ),
    )
    .returning({
      stock: productsTable.stock,
      productId: productsTable.productId,
    });
};
