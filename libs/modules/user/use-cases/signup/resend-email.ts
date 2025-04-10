import { selectUserByEmail } from "@user-db";
import { errors } from "@error-handling-utils";
import { sendSignupEmail } from "./utils/send-email";
import { getValidationSecret, setValidationSecret } from "@kv-adapter";
import { MAX_EMAILS_SENT, ONE_ATTEMPT } from "./utils/values";

export const resendEmail = async (email: string): Promise<void> => {
  const user = await selectUserByEmail(email);

  if (!user) {
    throw errors.USER_NOT_FOUND();
  }

  const secret = await getValidationSecret(email);

  if (!secret) {
    throw errors.VALIDATION_CODE_NOT_FOUND();
  }

  if (secret.emailsSent >= MAX_EMAILS_SENT) {
    throw errors.VALIDATION_CODE_EXPIRED();
  }

  if (!secret.code) {
    throw errors.VALIDATION_CODE_NOT_FOUND();
  }

  await setValidationSecret(email, {
    ...secret,
    emailsSent: secret.emailsSent + ONE_ATTEMPT,
  });

  await sendSignupEmail(user, secret.code);
};
