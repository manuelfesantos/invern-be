import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { acquireLock, getCacheKey, purgeCache, releaseLock } from "../utils";
import { stringifyObject } from "@string-utils";
import { z } from "zod";
import { ENV } from "@env-utils";

const STOCK_LOCK_TTL = 3000;
const MAX_RETRIES = 3;

let _stockBucket: R2Bucket | null = null;

const stockDataSchema = z.object({
  data: z.number(),
});

const getStockBucket = (): R2Bucket => {
  if (!_stockBucket) {
    _stockBucket = ENV.STOCK_BUCKET;
  }
  return _stockBucket;
};

const getStock = async (
  productId: string,
): Promise<{ data: number } | undefined> => {
  const bucketObject = await getStockBucket().get(productId);
  if (!bucketObject) {
    return undefined;
  }
  const productStock = await bucketObject?.json();

  logger().info("Got stock from bucket", {
    useCase: LoggerUseCaseEnum.GET_R2_STOCK,
    data: {
      productId,
      productStock,
    },
  });

  return stockDataSchema.parse(productStock);
};

const updateStock = async ({
  id: productId,
  stock,
}: {
  id: string;
  stock: number;
}): Promise<void> => {
  const stockBucket = getStockBucket();
  const lockKey = `lock-${productId}`;

  let stockUpdated = false;
  let retries = 0;

  while (!stockUpdated && retries < MAX_RETRIES) {
    retries++;
    const lock = await acquireLock(stockBucket, lockKey, STOCK_LOCK_TTL);

    if (lock) {
      await stockBucket.put(productId, stringifyObject({ data: stock }));
      const cacheKey = getCacheKey(ENV.STOCK_HOST, productId);
      if (cacheKey) {
        await purgeCache(cacheKey);
      }

      await releaseLock(stockBucket, lockKey);

      stockUpdated = true;

      logger().info("Updated stock in bucket", {
        useCase: LoggerUseCaseEnum.PUT_R2_STOCK,
        data: {
          productId,
          stock,
        },
      });
    } else {
      logger().warn("Failed to acquire lock, trying again", {
        useCase: LoggerUseCaseEnum.PUT_R2_STOCK,
        data: {
          productId,
        },
      });
    }
  }
};

const updateMany = async (
  products: { id: string; stock: number }[],
): Promise<void> => {
  await Promise.all(
    products.map(async (product) => {
      await updateStock(product);
    }),
  );
};

const deleteStock = async (productId: string): Promise<void> => {
  await getStockBucket().delete(productId);

  logger().info("Deleted stock from bucket", {
    useCase: LoggerUseCaseEnum.DELETE_R2_STOCK,
    data: {
      productId,
    },
  });
};

export const stockClient = {
  get: getStock,
  delete: deleteStock,
  updateMany,
};
