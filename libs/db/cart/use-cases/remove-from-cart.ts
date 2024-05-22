import { db } from "@db";
import { productsToCartsTable } from "@schema";
import { getQuantityInCart } from "./get-quantity-in-cart";
import { and, eq } from "drizzle-orm";
import { errors } from "@error-handling-utils";

export const removeFromCart = async (
  cartId: string,
  productId: string,
  quantity: number,
): Promise<void> => {
  const quantityInCart = await getQuantityInCart(cartId, productId);
  if (!quantityInCart) {
    throw errors.PRODUCT_NOT_IN_CART();
  }
  if (quantityInCart <= quantity) {
    await db()
      .delete(productsToCartsTable)
      .where(
        and(
          eq(productsToCartsTable.cartId, cartId),
          eq(productsToCartsTable.productId, productId),
        ),
      );
  } else {
    await db()
      .update(productsToCartsTable)
      .set({
        quantity: quantityInCart - quantity,
      })
      .where(
        and(
          eq(productsToCartsTable.cartId, cartId),
          eq(productsToCartsTable.productId, productId),
        ),
      );
  }
};
