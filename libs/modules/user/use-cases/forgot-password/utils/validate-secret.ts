import { errors } from "@error-handling-utils";
import { getDateTime } from "@timer-utils";
import { getForgotPasswordSecret, setForgotPasswordSecret } from "@kv-adapter";
import { NO_ATTEMPTS_LEFT, ONE_ATTEMPT, SECRET_EXPIRY_MINUTES } from "./values";

export const validateSecret = async (
  key: string,
  code: string,
): Promise<void> => {
  const secret = await getForgotPasswordSecret(key);
  if (!secret) throw errors.FORGOT_SECRET_NOT_FOUND();
  if (secret.attemptsLeft <= NO_ATTEMPTS_LEFT) {
    throw errors.FORGOT_SECRET_EXHAUSTED(SECRET_EXPIRY_MINUTES);
  }
  if (secret.code !== code) {
    await setForgotPasswordSecret(key, {
      ...secret,
      attemptsLeft: secret.attemptsLeft - ONE_ATTEMPT,
    });
    throw errors.INVALID_FORGOT_SECRET();
  }
  if (secret.expiresAt < getDateTime()) throw errors.FORGOT_SECRET_EXPIRED();
};
