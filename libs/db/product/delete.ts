import { db } from "@db";
import { contextStore } from "@context-utils";
import { productsTable } from "@schema";
import { eq } from "drizzle-orm";

export const deleteProduct = async (productId: string): Promise<void> => {
  await (contextStore.context.transaction ?? db())
    .delete(productsTable)
    .where(eq(productsTable.id, productId));
};
