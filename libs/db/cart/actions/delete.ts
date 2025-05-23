import { cartsTable, productsToCartsTable } from "@schema";
import { and, eq } from "drizzle-orm";
import { db } from "@db";
import { actionBuilder } from "@generics-db";

const deleteCartQuery = (cartId: string) =>
  db().delete(cartsTable).where(eq(cartsTable.id, cartId));

const deleteProductFromCartQuery = (productId: string, cartId: string) =>
  db()
    .delete(productsToCartsTable)
    .where(
      and(
        eq(productsToCartsTable.productId, productId),
        eq(productsToCartsTable.cartId, cartId),
      ),
    );

export const getDeleteCartAction = actionBuilder(deleteCartQuery);

export const getDeleteProductFromCartAction = actionBuilder(
  deleteProductFromCartQuery,
);
