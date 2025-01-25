import { getRandomUUID } from "@crypto-utils";
import { db } from "@db";
import { contextStore } from "@context-utils";
import { cartsTable } from "@schema";
import { Cart } from "@cart-entity";

const FIRST_INDEX = 0;

export const insertCart = async ({
  isLoggedIn,
}: {
  isLoggedIn: boolean;
}): Promise<{ cartId: string }[]> => {
  const insertCart = {
    id: getRandomUUID(),
    lastModifiedAt: Date.now(),
    isLoggedIn,
  };

  return (contextStore.context.transaction ?? db())
    .insert(cartsTable)
    .values(insertCart)
    .returning({
      cartId: cartsTable.id,
    });
};

export const insertCartReturningAll = async ({
  isLoggedIn,
}: {
  isLoggedIn: boolean;
}): Promise<Cart> => {
  const insertCart = {
    id: getRandomUUID(),
    lastModifiedAt: Date.now(),
    isLoggedIn,
  };
  const returnedCart = (
    await (contextStore.context.transaction ?? db())
      .insert(cartsTable)
      .values(insertCart)
      .returning()
  )[FIRST_INDEX];
  return Object.assign({}, returnedCart, { products: [] });
};
