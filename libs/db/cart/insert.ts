import { getRandomUUID } from "@crypto-utils";
import { db } from "@db";
import { cartsTable } from "@schema";

export const insertCart = async (): Promise<{ cartId: string }[]> => {
  const insertCart = {
    id: getRandomUUID(),
  };
  return db().insert(cartsTable).values(insertCart).returning({
    cartId: cartsTable.id,
  });
};
