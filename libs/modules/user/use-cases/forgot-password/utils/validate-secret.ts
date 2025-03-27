import { ForgotSecretBody } from "@user-entity";
import { errors } from "@error-handling-utils";
import { getDateTime } from "@timer-utils";

export const validateSecret = (
  secret: ForgotSecretBody | null,
  code: string,
): void => {
  if (!secret) throw errors.FORGOT_SECRET_NOT_FOUND();
  if (secret.code !== code) throw errors.INVALID_FORGOT_SECRET();
  if (secret.expiresAt < getDateTime()) throw errors.FORGOT_SECRET_EXPIRED();
};
