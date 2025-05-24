import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";

const MAX_RETRIES = 3;
const ONE_INCREMENT = 1;
const MIN_RETRIES = 0;
export const withRetry = async <T, K>(
  args: T,
  callBack: (args: T) => Promise<K>,
  retries: number = MIN_RETRIES,
): Promise<K> => {
  try {
    return await callBack(args);
  } catch (error) {
    logger().warn("Retrying payment operation", {
      useCase: LoggerUseCaseEnum.RETRY_INSERT_PAYMENT,
      data: {
        error: error instanceof Error ? error.message : error,
        retries,
      },
    });
    if (retries < MAX_RETRIES) {
      return withRetry(args, callBack, retries + ONE_INCREMENT);
    }
    throw error;
  }
};
