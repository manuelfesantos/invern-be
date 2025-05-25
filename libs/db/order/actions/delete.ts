import { db } from "@db";
import { ordersTable } from "@schema";
import { eq } from "drizzle-orm";
import { actionBuilder } from "@generics-db";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";

const deleteOrderQuery = (orderId: string) => {
  logger().info("deleting order", {
    useCase: LoggerUseCaseEnum.DELETE_ORDER,
    data: {
      orderId,
    },
  });
  return db().delete(ordersTable).where(eq(ordersTable.id, orderId));
};

export const getDeleteOrderAction = actionBuilder(deleteOrderQuery);
