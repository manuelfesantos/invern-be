import { InsertProduct } from "@product-entity";
import { productsTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";

export const updateProduct = async (
  productId: string,
  changes: Partial<InsertProduct>,
): Promise<void> => {
  await db()
    .update(productsTable)
    .set(changes)
    .where(eq(productsTable.productId, productId));
};
