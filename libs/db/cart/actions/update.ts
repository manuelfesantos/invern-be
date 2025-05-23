import { InsertCart } from "@cart-entity";
import { db } from "@db";
import { cartsTable, productsToCartsTable } from "@schema";
import { and, eq } from "drizzle-orm";
import { actionBuilder } from "@generics-db";

const updateCartQuery = (cartId: string, changes: Partial<InsertCart>) =>
  db().update(cartsTable).set(changes).where(eq(cartsTable.id, cartId));

const updateProductQuantityInCartQuery = (
  productId: string,
  cartId: string,
  quantity: number,
) =>
  db()
    .update(productsToCartsTable)
    .set({ quantity })
    .where(
      and(
        eq(productsToCartsTable.productId, productId),
        eq(productsToCartsTable.cartId, cartId),
      ),
    );

export const getUpdateCartAction = actionBuilder(updateCartQuery);

export const getUpdateProductQuantityInCartAction = actionBuilder(
  updateProductQuantityInCartQuery,
);
