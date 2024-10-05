import { stockHost } from "@http-utils";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { HttpStatusEnum } from "@http-entity";

let cacheApiKey: string | null = null;
let zoneId: string | null = null;
let cacheApiEmail: string | null = null;

export const initCacheApiKey = (apiKey: string): void => {
  if (!cacheApiKey) {
    cacheApiKey = apiKey;
  }
};

export const initCacheApiEmail = (email: string): void => {
  if (!cacheApiEmail) {
    cacheApiEmail = email;
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

  if (!cacheApiEmail) {
    throw new Error("Cache API email not set");
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Key": cacheApiKey,
        "X-Auth-Email": cacheApiEmail,
      },
      body: JSON.stringify({
        files: Array.isArray(cacheKey) ? cacheKey : [cacheKey],
      }),
    },
  );
  if (response.status !== HttpStatusEnum.OK) {
    logger().error(
      "Failed to purge cache",
      LoggerUseCaseEnum.PURGE_STOCK_CACHE,
      {
        responseStatus: response.status,
      },
    );
    throw new Error(`Failed to purge cache for ${cacheKey}`);
  }
  const responseBody = await response.json();
  logger().info(
    `purged cache for ${cacheKey}`,
    LoggerUseCaseEnum.PURGE_STOCK_CACHE,
    {
      responseStatus: response.status,
      responseBody,
    },
  );
};

export const getCacheKey = (productId: string): string | undefined =>
  stockHost() ? `${stockHost()}/${productId}` : undefined;
