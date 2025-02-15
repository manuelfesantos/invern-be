import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { acquireLock, getCacheKey, purgeCache, releaseLock } from "../utils";
import { stringifyObject } from "@string-utils";
import { z } from "zod";
import { stockHost } from "@http-utils";

const STOCK_LOCK_TTL = 3000;
const MAX_RETRIES = 3;

let stockBucket: R2Bucket | null = null;

const stockDataSchema = z.object({
  data: z.number(),
});

const init = (bucket: R2Bucket): void => {
  if (!stockBucket) {
    stockBucket = bucket;
  }
};

const getStock = async (
  productId: string,
): Promise<{ data: number } | undefined> => {
  if (!stockBucket) {
    logger().error("Stock bucket client not initialized", {
      useCase: LoggerUseCaseEnum.GET_R2_STOCK,
    });
    throw new Error("Stock bucket client not initialized");
  }

  const bucketObject = await stockBucket.get(productId);
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
  if (!stockBucket) {
    logger().error("Stock bucket client not initialized", {
      useCase: LoggerUseCaseEnum.PUT_R2_STOCK,
    });
    throw new Error("Stock bucket client not initialized");
  }

  const lockKey = `lock-${productId}`;

  let stockUpdated = false;
  let retries = 0;

  while (!stockUpdated && retries < MAX_RETRIES) {
    retries++;
    const lock = await acquireLock(stockBucket, lockKey, STOCK_LOCK_TTL);

    if (lock) {
      await stockBucket.put(productId, stringifyObject({ data: stock }));
      const cacheKey = getCacheKey(stockHost(), productId);
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
  if (!stockBucket) {
    logger().error("Stock bucket client not initialized", {
      useCase: LoggerUseCaseEnum.PUT_R2_STOCK,
    });
    throw new Error("Stock bucket client not initialized");
  }

  Promise.all(
    products.map(async (product) => {
      await updateStock(product);
    }),
  );
};

const deleteStock = async (productId: string): Promise<void> => {
  if (!stockBucket) {
    logger().error("Stock bucket client not initialized", {
      useCase: LoggerUseCaseEnum.DELETE_R2_STOCK,
    });
    throw new Error("Stock bucket client not initialized");
  }
  await stockBucket.delete(productId);

  logger().info("Deleted stock from bucket", {
    useCase: LoggerUseCaseEnum.DELETE_R2_STOCK,
    data: {
      productId,
    },
  });
};

export const stockClient = {
  init,
  get: getStock,
  delete: deleteStock,
  update: updateStock,
  updateMany,
};
