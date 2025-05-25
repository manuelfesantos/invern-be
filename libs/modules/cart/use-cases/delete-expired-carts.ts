import { getDeleteExpiredCartsAction } from "@cart-db";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";

export const deleteExpiredCarts = async (): Promise<string> => {
  const expiredCartIds = await getDeleteExpiredCartsAction().run();
  logger().info(`Deleted ${expiredCartIds.length} expired carts`, {
    useCase: LoggerUseCaseEnum.DELETE_EXPIRED_CARTS,
    data: {
      expiredCartIds: expiredCartIds.map((cart) => cart.id),
    },
  });
  return `Deleted ${expiredCartIds.length} expired carts`;
};
