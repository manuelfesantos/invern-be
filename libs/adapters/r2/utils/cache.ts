import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { HttpMethodEnum, HttpStatusEnum } from "@http-entity";
import { ENV } from "@env-utils";

export const purgeCache = async (
  cacheKey: string | string[],
): Promise<void> => {
  if (ENV.ENV === "local") return;

  const { ZONE_ID, CACHE_API_KEY, CACHE_API_EMAIL } = ENV;

  if (!CACHE_API_KEY) {
    throw new Error("Cache API key not set");
  }

  if (!ZONE_ID) {
    throw new Error("Zone ID not set");
  }

  if (!CACHE_API_EMAIL) {
    throw new Error("Cache API email not set");
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache`,
    {
      method: HttpMethodEnum.POST,
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Key": CACHE_API_KEY,
        "X-Auth-Email": CACHE_API_EMAIL,
      },
      body: JSON.stringify({
        files: getFiles(cacheKey),
      }),
    },
  );
  if (response.status !== HttpStatusEnum.OK) {
    logger().error("Failed to purge cache", {
      useCase: LoggerUseCaseEnum.PURGE_CACHE,
      data: {
        responseStatus: response.status,
      },
    });
    throw new Error(`Failed to purge cache for ${cacheKey}`);
  }
  const responseBody = await response.json();
  logger().info(`purged cache for ${cacheKey}`, {
    useCase: LoggerUseCaseEnum.PURGE_CACHE,
    data: {
      responseStatus: response.status,
      responseBody,
    },
  });
};

export const getCacheKey = (host: string, key: string): string | undefined =>
  host ? `${host}/${key}` : undefined;

export const getFiles = (
  cacheKey: string | string[],
): { url: string; headers: Record<string, string> }[] => {
  if (Array.isArray(cacheKey)) {
    return cacheKey.map((key) => ({
      url: key,
      headers: { origin: ENV.FRONTEND_HOST },
    }));
  }

  return [{ url: cacheKey, headers: { origin: ENV.FRONTEND_HOST } }];
};
