import { db } from "@db";
import { cartsTable, productsToCartsTable } from "@schema";
import { and, eq } from "drizzle-orm";

const FIRST_INDEX = 0;

export const updateProductQuantityInCart = async (
  productId: string,
  cartId: string,
  quantity: number,
): Promise<number> => {
  const newQuantity = await db().batch([
    db()
      .update(productsToCartsTable)
      .set({ quantity })
      .where(
        and(
          eq(productsToCartsTable.productId, productId),
          eq(productsToCartsTable.cartId, cartId),
        ),
      )
      .returning({ quantity: productsToCartsTable.quantity }),
    db()
      .update(cartsTable)
      .set({ lastModifiedAt: Date.now() })
      .where(eq(cartsTable.id, cartId)),
  ]);

  return newQuantity[FIRST_INDEX][FIRST_INDEX].quantity;
};
