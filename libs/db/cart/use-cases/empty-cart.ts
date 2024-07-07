import { db } from "@db";
import { productsToCartsTable } from "@schema";
import { eq } from "drizzle-orm";

export const emptyCart = async (cartId: string): Promise<void> => {
  await db()
    .delete(productsToCartsTable)
    .where(eq(productsToCartsTable.cartId, cartId));
};
