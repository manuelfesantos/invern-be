import { productsToCartsTable } from "@schema";
import { and, eq } from "drizzle-orm";
import { db } from "@db";

const QUANTITY_VALUE_ZERO = 0;

export const getQuantityInCart = async (
  cartId: string,
  productId: string,
): Promise<number> => {
  const result = await db().query.productsToCartsTable.findFirst({
    where: and(
      eq(productsToCartsTable.cartId, cartId),
      eq(productsToCartsTable.productId, productId),
    ),
    columns: {
      quantity: true,
    },
  });

  return result?.quantity ?? QUANTITY_VALUE_ZERO;
};
