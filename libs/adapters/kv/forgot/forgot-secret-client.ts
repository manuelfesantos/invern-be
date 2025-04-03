import { ENV } from "@env-utils";
import { ForgotSecretBody, forgotSecretBodySchema } from "@user-entity";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";

export const getForgotPasswordSecret = async (
  key: string,
): Promise<ForgotSecretBody | null> => {
  logger().info(`getting forgot password secret for key ${key}`, {
    useCase: LoggerUseCaseEnum.GET_FORGOT_PASSWORD_SECRET,
  });
  const secretKey = await ENV.FORGOT_KV.get(key);
  if (!secretKey) {
    logger().info(`no forgot password secret found for key ${key}`, {
      useCase: LoggerUseCaseEnum.GET_FORGOT_PASSWORD_SECRET,
    });
    return null;
  }

  logger().info(`found forgot password secret for key ${key}`, {
    useCase: LoggerUseCaseEnum.GET_FORGOT_PASSWORD_SECRET,
  });

  return forgotSecretBodySchema.parse(JSON.parse(secretKey));
};

export const setForgotPasswordSecret = async (
  key: string,
  value: ForgotSecretBody,
): Promise<void> => {
  logger().info(`setting forgot password secret for key ${key}`, {
    useCase: LoggerUseCaseEnum.PUT_FORGOT_PASSWORD_SECRET,
  });
  await ENV.FORGOT_KV.put(key, JSON.stringify(value));
};

export const deleteForgotPasswordSecret = async (
  key: string,
): Promise<void> => {
  logger().info(`deleting forgot password secret for key ${key}`, {
    useCase: LoggerUseCaseEnum.DELETE_FORGOT_PASSWORD_SECRET,
  });
  await ENV.FORGOT_KV.delete(key);
};
