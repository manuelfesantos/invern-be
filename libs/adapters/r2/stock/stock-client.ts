import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { acquireLock, getCacheKey, purgeCache, releaseLock } from "../utils";
import { stringifyObject } from "@string-utils";
import { z } from "zod";
import { ENV } from "@env-utils";

const STOCK_LOCK_TTL = 3000;
const MAX_RETRIES = 5;

const stockDataSchema = z.object({
  data: z.number(),
});

const getStockFromBucket = async (
  productId: string,
): Promise<number | undefined> => {
  const bucketObject = await ENV.STOCK_BUCKET.get(productId);
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

  return stockDataSchema.parse(productStock).data;
};

const getStock = async (productId: string): Promise<number | null> => {
  const value = await ENV.STOCK_KV.get(productId);
  if (value === null) return null;
  return Number(value);
};

const updateStock = async ({
  id: productId,
  stock,
}: {
  id: string;
  stock: number;
}): Promise<void> => {
  await setKVStock(productId, stock);

  const lockKey = `lock-${productId}`;

  let stockUpdated = false;
  let retries = 0;

  while (!stockUpdated && retries < MAX_RETRIES) {
    const lock = await acquireLock(ENV.STOCK_BUCKET, lockKey, STOCK_LOCK_TTL);

    if (lock) {
      await ENV.STOCK_BUCKET.put(productId, stringifyObject({ data: stock }));
      const cacheKey = getCacheKey(ENV.STOCK_HOST, productId);
      await purgeCache(cacheKey);

      await releaseLock(ENV.STOCK_BUCKET, lockKey);

      stockUpdated = true;

      logger().info("Updated stock in bucket", {
        useCase: LoggerUseCaseEnum.PUT_R2_STOCK,
        data: {
          productId,
          stock,
        },
      });
      return;
    } else {
      logger().warn("Failed to acquire lock, trying again", {
        useCase: LoggerUseCaseEnum.PUT_R2_STOCK,
        data: {
          productId,
          stock,
          retries,
        },
      });
    }
    retries++;
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
  await ENV.STOCK_KV.delete(productId);
  await ENV.STOCK_BUCKET.delete(productId);

  logger().info("Deleted stock from bucket and kv", {
    useCase: LoggerUseCaseEnum.DELETE_R2_STOCK,
    data: {
      productId,
    },
  });
};

const setKVStock = async (productId: string, stock: number): Promise<void> => {
  await ENV.STOCK_KV.put(productId, stock.toString(), {
    expirationTtl: 43200 /* expires in 12 hours */,
  });

  logger().info("Updated stock in kv", {
    useCase: LoggerUseCaseEnum.PUT_KV_STOCK,
    data: {
      productId,
      stock,
    },
  });
};

export const stockClient = {
  getFromBucket: getStockFromBucket,
  get: getStock,
  delete: deleteStock,
  updateMany,
  setKV: setKVStock,
};
