import {
  getInsertUserAction,
  getSelectUserByEmailAction,
  getSelectUserByIdAction,
  getUpdateUserAction,
} from "@user-db";
import { getInsertCartAction, getUpdateCartAction } from "@cart-db";
import { errors } from "@error-handling-utils";
import { insertUserSchema, User, ValidateEmailSecretBody } from "@user-entity";
import { setAuthSecret, setValidationSecret } from "@kv-adapter";
import { getLoggedInRefreshToken } from "@jwt-utils";
import { contextStore } from "@context-utils";
import { generateRandomEightDigitCode } from "@number-utils";
import { getDateTime, getFutureDate, SIGNUP_EMAIL_EXPIRY } from "@timer-utils";
import { booleanSchema } from "@global-entity";
import { sendSignupEmail } from "./utils/send-email";
import { getRandomUUID, hashPassword } from "@crypto-utils";
import { runBatchOperation } from "@generics-db";

export const signupBodySchema = insertUserSchema
  .omit({ cartId: true, id: true })
  .extend({
    remember: booleanSchema("remember me").default(false),
  });

export const signup = async (body: unknown): Promise<void> => {
  const { isLoggedIn, cartId } = contextStore.context;

  if (isLoggedIn) {
    throw errors.UNAUTHORIZED("already logged in");
  }

  const parsedBody = signupBodySchema.parse(body);

  const userFromDb = await getUser(parsedBody.email);

  let userId: string;

  if (!parsedBody.password) {
    throw errors.PASSWORD_REQUIRED();
  }

  if (userFromDb) {
    await getUpdateUserAction(userFromDb.id, {
      isOauth: false,
      password: await hashPassword(parsedBody.password, userFromDb.id),
    }).run();
    userId = userFromDb.id;
  } else {
    let updateCartAction: ReturnType<typeof getUpdateCartAction> | undefined =
      undefined;
    let insertCartAction: ReturnType<typeof getInsertCartAction> | undefined =
      undefined;

    if (cartId) {
      updateCartAction = getUpdateCartAction(cartId, {
        isLoggedIn: true,
      });
    } else {
      const newCartId = getRandomUUID();
      insertCartAction = getInsertCartAction({
        isLoggedIn: true,
        id: newCartId,
      });
      contextStore.context.cartId = newCartId;
    }

    userId = getRandomUUID();

    const insertUserAction = getInsertUserAction({
      ...parsedBody,
      password: await hashPassword(parsedBody.password, userId),
      cartId: contextStore.context.cartId,
      id: userId,
    });

    await runBatchOperation(
      (updateCartAction ?? insertCartAction) as ReturnType<
        typeof getUpdateCartAction | typeof getInsertCartAction
      >,
      insertUserAction,
    );

    const refreshToken = await getLoggedInRefreshToken(userId);
    await setAuthSecret(userId, refreshToken);
  }

  const user = await getSelectUserByIdAction(userId).run();

  const { cart } = user ?? {};

  if (!user) {
    throw errors.USER_NOT_FOUND();
  }

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
};

const getUser = async (email: string): Promise<User | undefined> => {
  const user = await getSelectUserByEmailAction(email).run();
  const userIsValid = !user || user.isOauth;
  if (!userIsValid) {
    throw errors.EMAIL_ALREADY_TAKEN();
  }

  return user;
};
