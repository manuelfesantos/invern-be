import { stockHost } from "@http-utils";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";

let cacheApiKey: string | null = null;
let zoneId: string | null = null;

export const initCacheApiKey = (apiKey: string): void => {
  if (!cacheApiKey) {
    cacheApiKey = apiKey;
  }
};

export const initZoneId = (id: string): void => {
  if (!zoneId) {
    zoneId = id;
  }
};

export const purgeCache = async (
  cacheKey: string | string[],
): Promise<void> => {
  if (!cacheApiKey) {
    throw new Error("Cache API key not set");
  }

  if (!zoneId) {
    throw new Error("Zone ID not set");
  }

  await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cacheApiKey}`,
      },
      body: JSON.stringify({
        files: Array.isArray(cacheKey) ? cacheKey : [cacheKey],
      }),
    },
  );
  logger().info(
    `purged cache for ${cacheKey}`,
    LoggerUseCaseEnum.PURGE_STOCK_CACHE,
  );
};

export const getCacheKey = (productId: string): string | undefined =>
  stockHost() ? `${stockHost()}/${productId}` : undefined;
