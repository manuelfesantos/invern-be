import { ENV } from "@env-utils";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import type { ZodType } from "zod";
import type {
  BaseValidationSecretBody} from "@user-entity";
import {
  baseValidationSecretBodySchema,
} from "@user-entity";

export const getBaseValidationSecret = async <
  T extends BaseValidationSecretBody = BaseValidationSecretBody,
>(
  key: string,
  schema: ZodType<T> = baseValidationSecretBodySchema as unknown as ZodType<T>,
): Promise<T | null> => {
  const secret = await ENV.VALIDATION_KV.get(key);
  if (!secret) {
    logger().info(`no validation secret secret found for key ${key}`, {
      useCase: LoggerUseCaseEnum.GET_VALIDATION_SECRET,
    });

    return null;
  }
  logger().info(`found validation secret for key ${key}`, {
    useCase: LoggerUseCaseEnum.GET_VALIDATION_SECRET,
  });

  return schema.parse(JSON.parse(secret));
};

export const setBaseValidationSecret = async <
  T extends BaseValidationSecretBody,
>(
  key: string,
  value: T,
): Promise<void> => {
  logger().info(`setting validation secret secret for key ${key}`, {
    useCase: LoggerUseCaseEnum.PUT_VALIDATION_SECRET,
  });
  await ENV.VALIDATION_KV.put(key, JSON.stringify(value));
};

export const deleteBaseValidationSecret = async (
  key: string,
): Promise<void> => {
  logger().info(`deleting validation secret secret for key ${key}`, {
    useCase: LoggerUseCaseEnum.DELETE_VALIDATION_SECRET,
  });
  await ENV.VALIDATION_KV.delete(key);
};
