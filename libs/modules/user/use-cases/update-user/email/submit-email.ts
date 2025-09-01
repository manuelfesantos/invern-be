import { getSelectUserByEmailAction, getSelectUserByIdAction } from "@user-db";
import { errors } from "@error-handling-utils";
import { contextStore } from "@context-utils";
import { updateEmailBodySchema } from "../types/update-user";
import { generateRandomEightDigitCode } from "@number-utils";
import { getDateTime, getFutureDate, SIGNUP_EMAIL_EXPIRY } from "@timer-utils";
import type { User, ValidateEmailSecretBody } from "@user-entity";
import { setValidationSecret } from "@kv-adapter";
import { sendVerifyEmail } from "@sendgrid-adapter";
import { logCredentials } from "@logger-utils";
import { SECRET_EXPIRY_MINUTES } from "../utils/values";

export const updateUserEmail = async (body: unknown): Promise<void> => {
  const { userId, remember, cartId } = contextStore.context;
  if (!userId) {
    throw errors.UNAUTHORIZED("not logged in");
  }

  logCredentials(cartId, userId);

  const { email } = updateEmailBodySchema.parse(body);
  await checkIfEmailIsTaken(email);
  const user = await getSelectUserByIdAction(userId).run();

  if (!user) {
    throw errors.USER_NOT_FOUND();
  }

  const validationCode = generateRandomEightDigitCode();

  const expiresAt = getDateTime(
    getFutureDate(SIGNUP_EMAIL_EXPIRY, "milliseconds"),
  );

  const validationSecretBody: ValidateEmailSecretBody = {
    code: validationCode,
    expiresAt,
    emailsSent: 1,
    attemptsLeft: 3,
    remember: remember ?? false,
    newEmail: email,
  };

  await setValidationSecret(user.email, validationSecretBody);

  await sendEmailToUser(validationCode, user, email);
};

const checkIfEmailIsTaken = async (email: string): Promise<void> => {
  const user = await getSelectUserByEmailAction(email).run();
  if (user) {
    throw errors.EMAIL_ALREADY_TAKEN();
  }
};

const sendEmailToUser = async (
  code: string,
  user: User,
  newEmail: string,
): Promise<void> => {
  await sendVerifyEmail(user, code, SECRET_EXPIRY_MINUTES, newEmail);
};
