import { db } from "@db";
import { cartsTable, productsToCartsTable } from "@schema";
import { and, eq } from "drizzle-orm";

export const deleteProductFromCart = async (
  productId: string,
  cartId: string,
): Promise<void> => {
  await db().batch([
    db()
      .delete(productsToCartsTable)
      .where(
        and(
          eq(productsToCartsTable.productId, productId),
          eq(productsToCartsTable.cartId, cartId),
        ),
      ),
    db()
      .update(cartsTable)
      .set({ lastModifiedAt: Date.now() })
      .where(eq(cartsTable.id, cartId)),
  ]);
};
