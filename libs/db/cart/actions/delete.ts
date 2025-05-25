import { cartsTable, productsToCartsTable } from "@schema";
import { and, eq, lt } from "drizzle-orm";
import { db } from "@db";
import { actionBuilder } from "@generics-db";
import { CART_EXPIRY, getPastDate } from "@timer-utils";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";

const deleteCartQuery = (cartId: string) => {
  logger().info("deleting cart", {
    useCase: LoggerUseCaseEnum.DELETE_CART,
    data: {
      cartId,
    },
  });
  return db().delete(cartsTable).where(eq(cartsTable.id, cartId));
};

const deleteProductFromCartQuery = (productId: string, cartId: string) =>
  db()
    .delete(productsToCartsTable)
    .where(
      and(
        eq(productsToCartsTable.productId, productId),
        eq(productsToCartsTable.cartId, cartId),
      ),
    );

const deleteExpiredCartsQuery = () =>
  db()
    .delete(cartsTable)
    .where(
      and(
        lt(
          cartsTable.lastModifiedAt,
          new Date(getPastDate(CART_EXPIRY, "milliseconds")).toISOString(),
        ),
        eq(cartsTable.isLoggedIn, false),
      ),
    )
    .returning({ id: cartsTable.id });

export const getDeleteCartAction = actionBuilder(deleteCartQuery);

export const getDeleteProductFromCartAction = actionBuilder(
  deleteProductFromCartQuery,
);

export const getDeleteExpiredCartsAction = actionBuilder(
  deleteExpiredCartsQuery,
);
