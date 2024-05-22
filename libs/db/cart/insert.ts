import { InsertCart } from "@cart-entity";
import { getRandomUUID } from "@crypto-utils";
import { db } from "../db-client";
import { cartsTable } from "@schema";

export const insertCart = async (
  cart: InsertCart,
): Promise<{ cartId: string }[]> => {
  const insertCart = {
    ...cart,
    cartId: getRandomUUID(),
  };
  return db().insert(cartsTable).values(insertCart).returning({
    cartId: cartsTable.cartId,
  });
};
