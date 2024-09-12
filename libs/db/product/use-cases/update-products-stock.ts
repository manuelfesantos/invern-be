import { ProductIdAndQuantity } from "@product-entity";
import { sql } from "drizzle-orm";
import { db } from "@db";
import { productsTable } from "@schema";

export const decreaseProductsStock = async (
  products: ProductIdAndQuantity[],
): Promise<void> => {
  const setQuery = sql`CASE ${products
    .map(
      (product) =>
        sql`WHEN productId = ${product.productId} THEN stock - ${product.quantity}`,
    )
    .reduce((acc, curr) => sql`${acc} ${curr}`)} ELSE stock END`;

  await db().update(productsTable).set({
    stock: setQuery,
  });
};

export const increaseProductsStock = async (
  products: ProductIdAndQuantity[],
): Promise<void> => {
  const setQuery = sql`CASE ${products
    .map(
      (product) =>
        sql`WHEN productId = ${product.productId} THEN stock + ${product.quantity}`,
    )
    .reduce((acc, curr) => sql`${acc} ${curr}`)} ELSE stock END`;

  await db().update(productsTable).set({
    stock: setQuery,
  });
};
