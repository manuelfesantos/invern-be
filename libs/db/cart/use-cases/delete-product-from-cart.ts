import { db } from "@db";
import { cartsTable, productsToCartsTable } from "@schema";
import { and, eq } from "drizzle-orm";
import { cartFromRawQueryResult, selectCartRawQuery } from "../select";
import { errors } from "@error-handling-utils";
import { Cart } from "@cart-entity";

export const deleteProductFromCart = async (
  productId: string,
  cartId: string,
): Promise<Cart> => {
  const [, , cartQueryResult] = await db().batch([
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
    selectCartRawQuery(cartId),
  ]);

  if (!cartQueryResult) throw errors.CART_NOT_FOUND();
  return cartFromRawQueryResult(cartQueryResult);
};
