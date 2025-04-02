import { selectUserByEmail } from "@user-db";
import { errors } from "@error-handling-utils";
import { sendEmail } from "@sendgrid-adapter";
import { generateRandomSixDigitCode } from "@number-utils";
import { FORGOT_SECRET_EXPIRY, getDateTime, getFutureDate } from "@timer-utils";
import { ForgotSecretBody } from "@user-entity";
import { setForgotPasswordSecret } from "@kv-adapter";
import queryString from "query-string";
import { ENV } from "@env-utils";
import { contextStore } from "@context-utils";

export const handleForgotPassword = async (email: string): Promise<void> => {
  const { country } = contextStore.context;
  const user = await selectUserByEmail(email);

  if (!user) throw errors.USER_NOT_FOUND();

  const code = generateRandomSixDigitCode();

  const forgotSecretBody: ForgotSecretBody = {
    code,
    expiresAt: getDateTime(getFutureDate(FORGOT_SECRET_EXPIRY, "milliseconds")),
  };

  await setForgotPasswordSecret(user.email, forgotSecretBody);

  const queryParams = queryString.stringify({
    email: user.email,
    code,
  });

  await sendEmail({
    to: user.email,
    subject: "Reset password",
    text: `Hi ${user.firstName}, here's your password reset code: ${code}. This code will expire in 5 minutes. You can also click on this link to reset your password: ${ENV.FRONTEND_HOST}/${country.code.toLowerCase()}/reset-password?${queryParams}`,
  });
};
