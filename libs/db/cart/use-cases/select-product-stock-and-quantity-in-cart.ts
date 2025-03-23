import { db } from "@db";
import { productsTable, productsToCartsTable } from "@schema";
import { and, eq } from "drizzle-orm";
import { errors } from "@error-handling-utils";

const NO_QUANTITY = 0;

export const selectProductStockAndQuantityInCart = async (
  productId: string,
  cartId: string,
): Promise<{ stock: number; quantity: number }> => {
  const [productStock, productQuantityInCart] = await db().batch([
    db().query.productsTable.findFirst({
      where: eq(productsTable.id, productId),
      columns: {
        stock: true,
      },
    }),
    db().query.productsToCartsTable.findFirst({
      where: and(
        eq(productsToCartsTable.productId, productId),
        eq(productsToCartsTable.cartId, cartId),
      ),
      columns: {
        quantity: true,
      },
    }),
  ]);

  if (productStock === undefined) {
    throw errors.PRODUCT_NOT_FOUND();
  }

  return {
    stock: productStock.stock,
    quantity: productQuantityInCart?.quantity || NO_QUANTITY,
  };
};
