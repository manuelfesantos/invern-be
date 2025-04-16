import { selectUserByEmail, selectUserById } from "@user-db";
import { errors } from "@error-handling-utils";
import { contextStore } from "@context-utils";
import { updateEmailBodySchema } from "../types/update-user";
import { generateRandomEightDigitCode } from "@number-utils";
import { getDateTime, getFutureDate, SIGNUP_EMAIL_EXPIRY } from "@timer-utils";
import { User, ValidateEmailSecretBody } from "@user-entity";
import { setValidationSecret } from "@kv-adapter";
import { withTransaction } from "@db";
import { sendEmail } from "@sendgrid-adapter";
import { ENV } from "@env-utils";

export const updateUserEmail = withTransaction(
  async (body: unknown): Promise<void> => {
    const { userId, remember } = contextStore.context;
    if (!userId) {
      throw errors.UNAUTHORIZED("not logged in");
    }
    const { email } = updateEmailBodySchema.parse(body);
    await checkIfEmailIsTaken(email);
    const user = await selectUserById(userId);

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
  },
);

const checkIfEmailIsTaken = async (email: string): Promise<void> => {
  const user = await selectUserByEmail(email);
  if (user) {
    throw errors.EMAIL_ALREADY_TAKEN();
  }
};

const sendEmailToUser = async (
  code: string,
  user: User,
  newEmail: string,
): Promise<void> => {
  await sendEmail({
    to: newEmail,
    subject: `Welcome to ${ENV.SENDGRID_NAME}`,
    text: `Hi ${user.firstName}, welcome to ${ENV.SENDGRID_NAME}! Your validation code is: ${code}. This code will expire in 30 minutes.`,
  });
};
