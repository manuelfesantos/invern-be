import { db } from "@db";
import { productsTable } from "@schema";
import { eq } from "drizzle-orm";

export const deleteProduct = async (productId: string): Promise<void> => {
  await db()
    .delete(productsTable)
    .where(eq(productsTable.productId, productId));
};
