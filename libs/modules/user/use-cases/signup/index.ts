import {
  insertUser,
  selectUserByEmail,
  selectUserById,
  updateUser,
} from "@user-db";
import { insertCart, updateCart } from "@cart-db";
import { errors } from "@error-handling-utils";
import { insertUserSchema, User, ValidateEmailSecretBody } from "@user-entity";
import { setAuthSecret, setValidationSecret } from "@kv-adapter";
import { getLoggedInRefreshToken } from "@jwt-utils";
import { contextStore } from "@context-utils";
import { withTransaction } from "@db";
import { generateRandomEightDigitCode } from "@number-utils";
import { getDateTime, getFutureDate, SIGNUP_EMAIL_EXPIRY } from "@timer-utils";
import { booleanSchema } from "@global-entity";
import { sendSignupEmail } from "./utils/send-email";

export const signupBodySchema = insertUserSchema.omit({ cartId: true }).extend({
  remember: booleanSchema("remember me").default(false),
});

export const signup = withTransaction(async (body: unknown): Promise<void> => {
  const { isLoggedIn, cartId } = contextStore.context;

  if (isLoggedIn) {
    throw errors.UNAUTHORIZED("already logged in");
  }

  const parsedBody = signupBodySchema.parse(body);

  const userFromDb = await getUser(parsedBody.email);

  let userId: string;

  if (userFromDb) {
    await updateUser(userFromDb.id, {
      isOauth: false,
      password: parsedBody.password,
    });
    userId = userFromDb.id;
  } else {
    if (!cartId) {
      const [{ cartId: newCartId }] = await insertCart({ isLoggedIn: true });
      contextStore.context.cartId = newCartId;
    } else {
      await updateCart(cartId, { isLoggedIn: true });
    }

    const [{ id }] = await insertUser({
      ...parsedBody,
      cartId: contextStore.context.cartId,
    });
    userId = id;

    const refreshToken = await getLoggedInRefreshToken(userId);
    await setAuthSecret(userId, refreshToken);
  }

  const user = await selectUserById(userId);

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

  await sendSignupEmail(user, validationCode);
});

const getUser = async (email: string): Promise<User | undefined> => {
  const user = await selectUserByEmail(email);
  const userIsValid = !user || user.isOauth;
  if (!userIsValid) {
    throw errors.EMAIL_ALREADY_TAKEN();
  }

  return user;
};
