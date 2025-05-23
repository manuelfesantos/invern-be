import { db } from "@db";
import { cartsTable, productsToCartsTable } from "@schema";
import { actionBuilder } from "@generics-db";
import { InsertCart } from "@cart-entity";

const insertCartQuery = (insertCart: InsertCart) =>
  db().insert(cartsTable).values(insertCart).returning({
    cartId: cartsTable.id,
  });

const insertProductInCartQuery = (
  productId: string,
  cartId: string,
  quantity: number,
) =>
  db()
    .insert(productsToCartsTable)
    .values({ productId, cartId, quantity })
    .returning();

export const getInsertCartAction = actionBuilder(insertCartQuery);

export const getInsertProductInCartAction = actionBuilder(
  insertProductInCartQuery,
);
