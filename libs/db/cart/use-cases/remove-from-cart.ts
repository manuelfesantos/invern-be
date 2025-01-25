import { db } from "@db";
import { contextStore } from "@context-utils";
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
    await (contextStore.context.transaction ?? db())
      .delete(productsToCartsTable)
      .where(
        and(
          eq(productsToCartsTable.cartId, cartId),
          eq(productsToCartsTable.productId, productId),
        ),
      );
  } else {
    await (contextStore.context.transaction ?? db())
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
