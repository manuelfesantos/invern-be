import { InsertOrder } from "@order-entity";
import { db } from "@db";
import { ordersTable } from "@schema";
import { getRandomUUID } from "@crypto-utils";

export const insertOrder = async (
  order: InsertOrder,
): Promise<
  {
    orderId: string;
  }[]
> => {
  const insertOrder = {
    ...order,
    orderId: getRandomUUID(),
    createdAt: new Date().toISOString(),
  };
  return db().insert(ordersTable).values(insertOrder).returning({
    orderId: ordersTable.orderId,
  });
};
