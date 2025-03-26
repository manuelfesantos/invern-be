import { db } from "@db";
import { productsToCartsTable } from "@schema";
import { and, eq } from "drizzle-orm";

export const deleteProductFromCart = (productId: string, cartId: string) =>
  db()
    .delete(productsToCartsTable)
    .where(
      and(
        eq(productsToCartsTable.productId, productId),
        eq(productsToCartsTable.cartId, cartId),
      ),
    );
