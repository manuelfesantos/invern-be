import { InsertOrder } from "@order-entity";
import { db } from "@db";
import { ordersTable } from "@schema";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { actionBuilder } from "@generics-db";

const insertOrderQuery = (order: InsertOrder) => {
  logger().info("inserting order", {
    useCase: LoggerUseCaseEnum.CREATE_ORDER,
    data: {
      insertedOrder: order,
    },
  });

  return db().insert(ordersTable).values(order).returning();
};

export const getInsertOrderAction = actionBuilder(insertOrderQuery);
