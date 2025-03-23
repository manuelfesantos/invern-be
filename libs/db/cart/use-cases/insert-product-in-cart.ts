import { db } from "@db";
import { cartsTable, productsToCartsTable } from "@schema";
import { eq } from "drizzle-orm";
import { cartFromRawQueryResult, selectCartRawQuery } from "../select";
import { Cart } from "@cart-entity";
import { errors } from "@error-handling-utils";

export const insertProductInCart = async (
  productId: string,
  cartId: string,
  quantity: number,
): Promise<Cart> => {
  const [, , cartQueryResult] = await db().batch([
    db().insert(productsToCartsTable).values({ productId, cartId, quantity }),
    db()
      .update(cartsTable)
      .set({ lastModifiedAt: Date.now() })
      .where(eq(cartsTable.id, cartId)),
    selectCartRawQuery(cartId),
  ]);
  if (!cartQueryResult) throw errors.CART_NOT_FOUND();
  return cartFromRawQueryResult(cartQueryResult);
};
