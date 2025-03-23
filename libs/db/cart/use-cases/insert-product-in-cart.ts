import { db } from "@db";
import { cartsTable, productsToCartsTable } from "@schema";
import { eq } from "drizzle-orm";

export const insertProductInCart = async (
  productId: string,
  cartId: string,
  quantity: number,
): Promise<void> => {
  await db().batch([
    db().insert(productsToCartsTable).values({ productId, cartId, quantity }),
    db()
      .update(cartsTable)
      .set({ lastModifiedAt: Date.now() })
      .where(eq(cartsTable.id, cartId)),
  ]);
};
