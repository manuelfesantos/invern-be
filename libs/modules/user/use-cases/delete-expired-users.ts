import { getDeleteExpiredUsersAction } from "@user-db";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";

export const deleteExpiredUsers = async (): Promise<string> => {
  const expiredUserIds = await getDeleteExpiredUsersAction().run();
  logger().info(`Deleted ${expiredUserIds.length} expired users`, {
    useCase: LoggerUseCaseEnum.DELETE_EXPIRED_CARTS,
    data: {
      expiredUserIds: expiredUserIds.map((user) => user.id),
    },
  });
  return `Deleted ${expiredUserIds.length} expired users`;
};
