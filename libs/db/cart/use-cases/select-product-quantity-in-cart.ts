import { db } from "@db";
import { productsToCartsTable } from "@schema";
import { and, eq } from "drizzle-orm";

export const selectProductQuantityInCart = (
  productId: string,
  cartId: string,
) =>
  db().query.productsToCartsTable.findFirst({
    where: and(
      eq(productsToCartsTable.productId, productId),
      eq(productsToCartsTable.cartId, cartId),
    ),
    columns: {
      quantity: true,
    },
  });
