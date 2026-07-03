import type {
  BaseValidationSecretBody,
  ValidateEmailSecretBody,
  ValidateNewEmailSecretBody,
} from "@user-entity";
import { errors } from "@error-handling-utils";
import {
  NO_ATTEMPTS_LEFT,
  ONE_ATTEMPT,
  SECRET_EXPIRY_MINUTES,
} from "../use-cases/forgot-password/utils/values";
import {
  getValidateEmailSecret,
  getValidateNewEmailSecret,
  getValidationSecret,
  setValidationSecret,
} from "@kv-adapter";
import { getDateTime } from "@timer-utils";

export const validateBaseSecret = async (
  key: string,
  code: string,
): Promise<BaseValidationSecretBody> => {
  const secret = await getValidationSecret(key);
  if (!secret) throw errors.FORGOT_SECRET_NOT_FOUND();
  return await validateSecret(key, code, secret);
};

export const validateEmailSecret = async (
  key: string,
  code: string,
): Promise<ValidateEmailSecretBody> => {
  const secret = await getValidateEmailSecret(key);
  if (!secret) throw errors.FORGOT_SECRET_NOT_FOUND();
  return await validateSecret(key, code, secret);
};

export const validateNewEmailSecret = async (
  key: string,
  code: string,
): Promise<ValidateNewEmailSecretBody> => {
  const secret = await getValidateNewEmailSecret(key);
  if (!secret) throw errors.FORGOT_SECRET_NOT_FOUND();
  return await validateSecret(key, code, secret);
};

const validateSecret = async <
  T extends BaseValidationSecretBody = BaseValidationSecretBody,
>(
  key: string,
  code: string,
  secret: T,
): Promise<T> => {
  if (!secret) throw errors.FORGOT_SECRET_NOT_FOUND();
  if (secret.attemptsLeft <= NO_ATTEMPTS_LEFT) {
    throw errors.FORGOT_SECRET_EXHAUSTED(SECRET_EXPIRY_MINUTES);
  }
  if (secret.code !== code) {
    await setValidationSecret(key, {
      ...secret,
      attemptsLeft: secret.attemptsLeft - ONE_ATTEMPT,
    });
    throw errors.INVALID_FORGOT_SECRET();
  }
  if (secret.expiresAt < getDateTime()) throw errors.FORGOT_SECRET_EXPIRED();

  return secret;
};
