import { selectUserByEmail } from "@user-db";
import { errors } from "@error-handling-utils";
import { sendEmail } from "@sendgrid-adapter";
import { generateRandomEightDigitCode } from "@number-utils";
import {
  FORGOT_SECRET_EXPIRY,
  getDateTime,
  getFutureDate,
  isDateInFuture,
} from "@timer-utils";
import { BaseValidationSecretBody, User } from "@user-entity";
import { getValidationSecret, setValidationSecret } from "@kv-adapter";
import queryString from "query-string";
import { ENV } from "@env-utils";
import { contextStore } from "@context-utils";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import {
  MAX_EMAILS_SENT,
  NO_ATTEMPTS_LEFT,
  ONE_ATTEMPT,
  SECRET_EXPIRY_MINUTES,
} from "./utils/values";

export const submitEmail = async (email: string): Promise<void> => {
  const { country } = contextStore.context;
  const user = await selectUserByEmail(email);

  if (!user) throw errors.USER_NOT_FOUND();

  logger().info("requesting password reset for user", {
    useCase: LoggerUseCaseEnum.FORGOT_PASSWORD,
    data: { user },
  });

  const code = await getPasswordResetCode(user);

  const queryParams = queryString.stringify({
    email: user.email,
    code,
    "validate-code": true,
  });

  await sendEmail({
    to: user.email,
    subject: "Reset password",
    text: `Hi ${user.firstName}, here's your password reset code: ${code}. This code will expire in 10 minutes. You can also click on this link to reset your password: ${ENV.FRONTEND_HOST}/${country.code.toLowerCase()}/forgot-password?${queryParams}`,
  });
};

const getPasswordResetCode = async (user: User): Promise<string> => {
  const forgotSecret = await getValidationSecret(user.email);

  if (!forgotSecret || secretIsExpired(forgotSecret)) {
    return await generateNewSecretCode(user.email);
  }

  if (secretIsExhausted(forgotSecret)) {
    throw errors.FORGOT_SECRET_EXHAUSTED(SECRET_EXPIRY_MINUTES);
  }

  await setValidationSecret(user.email, {
    ...forgotSecret,
    emailsSent: forgotSecret.emailsSent + ONE_ATTEMPT,
  });
  return forgotSecret.code;
};

const generateNewSecretCode = async (email: string): Promise<string> => {
  const code = generateRandomEightDigitCode();
  const expiresAt = getDateTime(
    getFutureDate(FORGOT_SECRET_EXPIRY, "milliseconds"),
  );

  logger().info("generated code for password reset", {
    useCase: LoggerUseCaseEnum.FORGOT_PASSWORD,
    data: { expiresAt },
  });

  const forgotSecretBody: BaseValidationSecretBody = {
    code,
    expiresAt: getDateTime(getFutureDate(FORGOT_SECRET_EXPIRY, "milliseconds")),
    attemptsLeft: 5,
    emailsSent: 1,
  };

  await setValidationSecret(email, forgotSecretBody);

  return code;
};

const secretIsExpired = (secret: BaseValidationSecretBody): boolean =>
  !isDateInFuture(secret.expiresAt);

const secretIsExhausted = (secret: BaseValidationSecretBody): boolean =>
  secret.attemptsLeft <= NO_ATTEMPTS_LEFT ||
  secret.emailsSent >= MAX_EMAILS_SENT;
