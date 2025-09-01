import { db } from "@db";
import { cartsTable, productsToCartsTable } from "@schema";
import { actionBuilder } from "@generics-db";
import type { InsertCart } from "@cart-entity";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";

const insertCartQuery = (insertCart: InsertCart) => {
  logger().info(`inserting cart with id ${insertCart.id}`, {
    useCase: LoggerUseCaseEnum.CREATE_CART,
    data: insertCart,
  });
  return db().insert(cartsTable).values(insertCart).returning({
    cartId: cartsTable.id,
  });
};

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
