import { InsertOrder } from "@order-entity";
import { db } from "@db";
import { ordersTable } from "@schema";

export const insertOrder = async (
  order: InsertOrder,
): Promise<
  {
    orderId: string;
  }[]
> => {
  const insertOrder = {
    ...order,
    createdAt: new Date().toISOString(),
    userId: order.userId ? order.userId : null,
  };

  return db().insert(ordersTable).values(insertOrder).returning({
    orderId: ordersTable.orderId,
  });
};
