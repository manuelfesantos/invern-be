import { errors } from "@error-handling-utils";
import { uuidSchema } from "@global-entity";
import { db } from "@db";
import { eq, inArray } from "drizzle-orm";
import { productsTable } from "@schema";

export const validateProductId = async (productId: string): Promise<void> => {
  const id = uuidSchema("product id").parse(productId);
  const productIsValid = Boolean(
    await db().query.productsTable.findFirst({
      where: eq(productsTable.id, id),
    }),
  );
  if (!productIsValid) {
    throw errors.PRODUCT_NOT_FOUND();
  }
};

export const validateProductIdAndGetStock = async (
  productId: string,
  quantity: number,
): Promise<number> => {
  const id = uuidSchema("product id").parse(productId);
  const product = await db().query.productsTable.findFirst({
    where: eq(productsTable.id, id),
  });
  if (!product) {
    throw errors.PRODUCT_NOT_FOUND();
  }
  if (!product.stock || quantity > product.stock) {
    throw errors.PRODUCT_OUT_OF_STOCK(product.stock);
  }

  return product.stock;
};

export const validateProductIds = async (
  productIds: string[],
): Promise<void> => {
  const ids = productIds.map((productId) =>
    uuidSchema("product id").parse(productId),
  );
  const products = await db().query.productsTable.findMany({
    where: inArray(productsTable.id, ids),
  });
  if (products.length !== ids.length) {
    const invalidIds = ids.filter(
      (id) => !products.some((product) => product.id === id),
    );
    throw errors.INVALID_PRODUCT_IDS(invalidIds);
  }
};
