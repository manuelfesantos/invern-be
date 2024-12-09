import { InsertOrder } from "@order-entity";
import { db } from "@db";
import { ordersTable } from "@schema";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";

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

  logger().info("inserting order", LoggerUseCaseEnum.CREATE_ORDER, {
    insertedOrder: insertOrder,
  });

  return db().insert(ordersTable).values(insertOrder).returning({
    orderId: ordersTable.orderId,
  });
};
