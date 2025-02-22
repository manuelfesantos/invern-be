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
  logger().info("inserting order", {
    useCase: LoggerUseCaseEnum.CREATE_ORDER,
    data: {
      insertedOrder: insertOrder,
    },
  });

  return db().insert(ordersTable).values(order).returning({
    orderId: ordersTable.id,
  });
};
