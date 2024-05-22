import { productsToCartsTable } from "@schema";
import { db } from "@db";
import { getQuantityInCart } from "./get-quantity-in-cart";
import { and, eq } from "drizzle-orm";

const QUANTITY_VALUE_ZERO = 0;

export const addToCart = async (
  cartId: string,
  productId: string,
  quantity: number,
): Promise<void> => {
  const quantityInCart = await getQuantityInCart(cartId, productId);
  if (quantityInCart === QUANTITY_VALUE_ZERO) {
    await db()
      .insert(productsToCartsTable)
      .values({ cartId, productId, quantity });
  } else {
    await db()
      .update(productsToCartsTable)
      .set({ quantity: quantityInCart + quantity })
      .where(
        and(
          eq(productsToCartsTable.cartId, cartId),
          eq(productsToCartsTable.productId, productId),
        ),
      );
  }
};
