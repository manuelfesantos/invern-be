import { InsertProduct } from "@product-entity";
import { productsTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { contextStore } from "@context-utils";

export const updateProduct = async (
  productId: string,
  changes: Partial<InsertProduct>,
): Promise<void> => {
  await (contextStore.context.transaction ?? db())
    .update(productsTable)
    .set(changes)
    .where(eq(productsTable.id, productId));
};
