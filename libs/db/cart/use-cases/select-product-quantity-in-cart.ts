import { db } from "@db";
import { and, eq } from "drizzle-orm";
import { productsToCartsTable } from "@schema";

const NO_QUANTITY = 0;

export const selectProductQuantityInCart = async (
  productId: string,
  cartId: string,
): Promise<number> => {
  const result = await db().query.productsToCartsTable.findFirst({
    where: and(
      eq(productsToCartsTable.productId, productId),
      eq(productsToCartsTable.cartId, cartId),
    ),
    columns: {
      quantity: true,
    },
  });

  return result?.quantity || NO_QUANTITY;
};
