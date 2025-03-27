import { ENV } from "@env-utils";
import { ForgotSecretBody, forgotSecretBodySchema } from "@user-entity";

export const getForgotPasswordSecret = async (
  key: string,
): Promise<ForgotSecretBody | null> => {
  const secretKey = await ENV.FORGOT_KV.get(key);
  if (!secretKey) return null;
  return forgotSecretBodySchema.parse(JSON.parse(secretKey));
};

export const setForgotPasswordSecret = async (
  key: string,
  value: ForgotSecretBody,
): Promise<void> => {
  await ENV.FORGOT_KV.put(key, JSON.stringify(value));
};

export const deleteForgotPasswordSecret = async (
  key: string,
): Promise<void> => {
  await ENV.FORGOT_KV.delete(key);
};
