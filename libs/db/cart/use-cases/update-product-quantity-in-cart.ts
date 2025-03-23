import { db } from "@db";
import { cartsTable, productsToCartsTable } from "@schema";
import { and, eq } from "drizzle-orm";
import { cartFromRawQueryResult, selectCartRawQuery } from "../select";
import { errors } from "@error-handling-utils";
import { Cart } from "@cart-entity";

export const updateProductQuantityInCart = async (
  productId: string,
  cartId: string,
  quantity: number,
): Promise<Cart> => {
  const [, , cartQueryResult] = await db().batch([
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
    selectCartRawQuery(cartId),
  ]);

  if (!cartQueryResult) throw errors.CART_NOT_FOUND();
  return cartFromRawQueryResult(cartQueryResult);
};
