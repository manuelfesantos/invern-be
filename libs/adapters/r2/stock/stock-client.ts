import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { acquireLock, getCacheKey, purgeCache, releaseLock } from "../utils";

const STOCK_LOCK_TTL = 3000;
const MAX_RETRIES = 3;

let stockBucket: R2Bucket | null = null;

const init = (bucket: R2Bucket): void => {
  if (!stockBucket) {
    stockBucket = bucket;
  }
};

const getStock = async (productId: string): Promise<number | undefined> => {
  if (!stockBucket) {
    logger().error(
      "Stock bucket client not initialized",
      LoggerUseCaseEnum.GET_R2_STOCK,
    );
    throw new Error("Stock bucket client not initialized");
  }

  const bucketObject = await stockBucket.get(productId);
  const productStock = Number(await bucketObject?.text());

  logger().info("Got stock from bucket", LoggerUseCaseEnum.GET_R2_STOCK, {
    productId,
    productStock,
  });

  return productStock;
};

const updateStock = async ({
  productId,
  stock,
}: {
  productId: string;
  stock: number;
}): Promise<void> => {
  if (!stockBucket) {
    logger().error(
      "Stock bucket client not initialized",
      LoggerUseCaseEnum.PUT_R2_STOCK,
    );
    throw new Error("Stock bucket client not initialized");
  }

  const lockKey = `lock-${productId}`;

  let stockUpdated = false;
  let retries = 0;

  while (!stockUpdated && retries < MAX_RETRIES) {
    retries++;
    const lock = await acquireLock(stockBucket, lockKey, STOCK_LOCK_TTL);

    if (lock) {
      await stockBucket.put(productId, stock.toString());
      const cacheKey = getCacheKey(productId);
      if (cacheKey) {
        await purgeCache(cacheKey);
      }

      await releaseLock(stockBucket, lockKey);

      stockUpdated = true;

      logger().info("Updated stock in bucket", LoggerUseCaseEnum.PUT_R2_STOCK, {
        productId,
        stock,
      });
    } else {
      logger().warn(
        "Failed to acquire lock, trying again",
        LoggerUseCaseEnum.PUT_R2_STOCK,
        {
          productId,
        },
      );
    }
  }
};

const deleteStock = async (productId: string): Promise<void> => {
  if (!stockBucket) {
    logger().error(
      "Stock bucket client not initialized",
      LoggerUseCaseEnum.DELETE_R2_STOCK,
    );
    throw new Error("Stock bucket client not initialized");
  }
  await stockBucket.delete(productId);

  logger().info(
    "Deleted stock from bucket",
    LoggerUseCaseEnum.DELETE_R2_STOCK,
    {
      productId,
    },
  );
};

export const stockClient = {
  init,
  get: getStock,
  delete: deleteStock,
  update: updateStock,
};
