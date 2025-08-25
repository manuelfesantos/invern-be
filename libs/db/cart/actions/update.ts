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

const upsertProductQuantityInCartQuery = (
  productId: string,
  cartId: string,
  quantity: number,
) =>
  db()
    .insert(productsToCartsTable)
    .values({
      productId,
      cartId,
      quantity,
    })
    .onConflictDoUpdate({
      target: [productsToCartsTable.productId, productsToCartsTable.cartId],
      set: { quantity },
    });

export const getUpdateCartAction = actionBuilder(updateCartQuery);

export const getUpdateProductQuantityInCartAction = actionBuilder(
  updateProductQuantityInCartQuery,
);

export const getUpsertProductQuantityInCartAction = actionBuilder(
  upsertProductQuantityInCartQuery,
);
