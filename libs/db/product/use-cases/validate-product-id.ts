import { errors } from "@error-handling-utils";
import { uuidSchema } from "@global-entity";
import { db } from "@db";
import { eq, inArray } from "drizzle-orm";
import { productsTable } from "@schema";

export const validateProductId = async (productId: string): Promise<void> => {
  const id = uuidSchema("product id").parse(productId);
  const productIsValid = Boolean(
    await db().query.productsTable.findFirst({
      where: eq(productsTable.productId, id),
    }),
  );
  if (!productIsValid) {
    throw errors.PRODUCT_NOT_FOUND();
  }
};

export const validateProductIds = async (
  productIds: string[],
): Promise<void> => {
  const ids = productIds.map((productId) =>
    uuidSchema("product id").parse(productId),
  );
  const products = await db().query.productsTable.findMany({
    where: inArray(productsTable.productId, ids),
  });
  if (products.length !== ids.length) {
    const invalidIds = ids.filter(
      (id) => !products.some((product) => product.productId === id),
    );
    throw errors.INVALID_PRODUCT_IDS(invalidIds);
  }
};
