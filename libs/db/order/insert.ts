import { InsertOrder } from "@order-entity";
import { db } from "../db-client";
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
  };
  return db().insert(ordersTable).values(insertOrder).returning({
    orderId: ordersTable.orderId,
  });
};
