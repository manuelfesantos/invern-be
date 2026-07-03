import { ENV } from "@env-utils";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { REFRESH_TOKEN_EXPIRY } from "@timer-utils";

export const getAuthSecret = async (key: string): Promise<string | null> => {
  const secret = await ENV.AUTH_KV.get(key);

  if (!secret) {
    logger().info(`no auth secret found for key ${key}`, {
      useCase: LoggerUseCaseEnum.GET_AUTH_SECRET,
    });
    return null;
  }

  logger().info(`getting auth secret for key ${key}`, {
    useCase: LoggerUseCaseEnum.GET_AUTH_SECRET,
  });

  return secret;
};

export const setAuthSecret = async (
  key: string,
  value: string,
): Promise<void> => {
  logger().info(`setting auth secret for key ${key}`, {
    useCase: LoggerUseCaseEnum.PUT_AUTH_SECRET,
  });
  // TTL matches the refresh-token lifetime so the stored secret self-expires.
  await ENV.AUTH_KV.put(key, value, { expirationTtl: REFRESH_TOKEN_EXPIRY });
};

export const deleteAuthSecret = async (key: string): Promise<void> => {
  logger().info(`deleting auth secret for key ${key}`, {
    useCase: LoggerUseCaseEnum.DELETE_AUTH_SECRET,
  });
  await ENV.AUTH_KV.delete(key);
};
