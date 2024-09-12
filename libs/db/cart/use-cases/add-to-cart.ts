import { productsToCartsTable } from "@schema";
import { db } from "@db";
import { getQuantityInCart } from "./get-quantity-in-cart";
import { and, eq } from "drizzle-orm";
import { errors } from "@error-handling-utils";

const QUANTITY_VALUE_ZERO = 0;

export const addToCart = async (
  cartId: string,
  productId: string,
  quantity: number,
  stock: number,
): Promise<void> => {
  const quantityInCart = await getQuantityInCart(cartId, productId);

  if (quantity + quantityInCart > stock) {
    throw errors.PRODUCT_OUT_OF_STOCK(stock);
  }

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
