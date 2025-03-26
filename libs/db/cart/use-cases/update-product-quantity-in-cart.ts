import { db } from "@db";
import { productsToCartsTable } from "@schema";
import { and, eq } from "drizzle-orm";

export const updateProductQuantityInCart = (
  productId: string,
  cartId: string,
  quantity: number,
) =>
  db()
    .update(productsToCartsTable)
    .set({ quantity })
    .where(
      and(
        eq(productsToCartsTable.productId, productId),
        eq(productsToCartsTable.cartId, cartId),
      ),
    );
