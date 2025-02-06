import { db } from "@db";
import { productsToCartsTable } from "@schema";
import { and, eq } from "drizzle-orm";

export const removeCartItemInDb = async (
  cartId: string,
  productId: string,
): Promise<void> => {
  await db()
    .delete(productsToCartsTable)
    .where(
      and(
        eq(productsToCartsTable.productId, productId),
        eq(productsToCartsTable.cartId, cartId),
      ),
    );
};
