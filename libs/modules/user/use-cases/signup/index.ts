import { insertUser, selectUserByEmail, selectUserById } from "@user-db";
import { insertCart, updateCart } from "@cart-db";
import { errors } from "@error-handling-utils";
import {
  insertUserSchema,
  UserValidationStatusEnum,
  ValidateEmailSecretBody,
} from "@user-entity";
import { setAuthSecret, setValidationSecret } from "@kv-adapter";
import { getLoggedInRefreshToken } from "@jwt-utils";
import { contextStore } from "@context-utils";
import { withTransaction } from "@db";
import { generateRandomEightDigitCode } from "@number-utils";
import { getDateTime, getFutureDate, SIGNUP_EMAIL_EXPIRY } from "@timer-utils";
import { sendEmail } from "@sendgrid-adapter";
import { ENV } from "@env-utils";
import { booleanSchema } from "@global-entity";
import queryString from "query-string";

export const signupBodySchema = insertUserSchema.omit({ cartId: true }).extend({
  remember: booleanSchema("remember me").default(false),
});

export const signup = withTransaction(async (body: unknown): Promise<void> => {
  const { isLoggedIn, cartId } = contextStore.context;

  if (isLoggedIn) {
    throw errors.UNAUTHORIZED("already logged in");
  }

  const parsedBody = signupBodySchema.parse(body);

  await validateThatEmailIsUnique(parsedBody.email);

  if (!cartId) {
    const [{ cartId: newCartId }] = await insertCart({ isLoggedIn: true });
    contextStore.context.cartId = newCartId;
  } else {
    await updateCart(cartId, { isLoggedIn: true });
  }

  const [{ id: userId }] = await insertUser({
    ...parsedBody,
    cartId: contextStore.context.cartId,
  });

  const user = await selectUserById(userId, UserValidationStatusEnum.ALL);

  const refreshToken = await getLoggedInRefreshToken(userId);
  await setAuthSecret(userId, refreshToken);

  const { cart } = user;

  if (!cart) {
    throw errors.CART_NOT_FOUND();
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
    remember: parsedBody.remember,
    newEmail: parsedBody.email,
  };

  await setValidationSecret(user.email, validationSecretBody);

  const queryParams = queryString.stringify({
    email: user.email,
    code: validationCode,
  });

  await sendEmail({
    to: user.email,
    subject: `Welcome to ${ENV.SENDGRID_NAME}`,
    text: `Hi ${user.firstName}, welcome to ${ENV.SENDGRID_NAME}! Your validation code is: ${validationCode}. This code will expire in 30 minutes. You can also use the following link to sign up: ${ENV.FRONTEND_HOST}/${contextStore.context.country.code.toLowerCase()}/sign-up/verify-email?${queryParams}`,
  });
});

const validateThatEmailIsUnique = async (email: string): Promise<void> => {
  const userExists = Boolean(
    await selectUserByEmail(email, UserValidationStatusEnum.ALL),
  );
  if (userExists) {
    throw errors.EMAIL_ALREADY_TAKEN();
  }
};
