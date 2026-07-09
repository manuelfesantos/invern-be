import {
  getInsertUserAction,
  getSelectUserByEmailAction,
  getSelectUserByIdAction,
  getUpdateUserAction,
} from "@user-db";
import { getInsertCartAction, getUpdateCartAction } from "@cart-db";
import { errors } from "@error-handling-utils";
import type { User, ValidateEmailSecretBody } from "@user-entity";
import { insertUserSchema } from "@user-entity";
import { setAuthSecret, setValidationSecret } from "@kv-adapter";
import { getLoggedInRefreshToken } from "@jwt-utils";
import { contextStore } from "@context-utils";
import { generateRandomEightDigitCode } from "@number-utils";
import { isLocalEnv } from "@http-utils";
import { getDateTime, getFutureDate, SIGNUP_EMAIL_EXPIRY } from "@timer-utils";
import { sendSignupEmail } from "./utils/send-email";
import { getRandomUUID } from "@crypto-utils";
import { runBatchOperation } from "@generics-db";
import { localLogger, logCredentials } from "@logger-utils";
import * as z from "zod";

export const signupBodySchema = insertUserSchema
  .pick({
    email: true,
    firstName: true,
    lastName: true,
    password: true,
  })
  .extend({
    remember: z.boolean(),
  });

export const signup = async (
  body: unknown,
): Promise<{ verificationCode?: string }> => {
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
      password: parsedBody.password,
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
      password: parsedBody.password,
      cartId: contextStore.context.cartId ?? null,
      id: userId,
      isOauth: false,
      googleUserId: null,
      isValidated: false,
      disabled: false,
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

  logCredentials(user?.cart?.id, userId);

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
  };

  await setValidationSecret(user.email, validationSecretBody);

  if (isLocalEnv()) {
    // Locally, skip the real email provider and surface the code directly so
    // the verify-email flow stays testable without hitting Brevo.
    localLogger.info(
      `signup verification code for ${user.email}: ${validationCode}`,
    );
    return { verificationCode: validationCode };
  }

  await sendSignupEmail(user, validationCode);

  return {};
};

const getUser = async (email: string): Promise<User | undefined> => {
  const user = await getSelectUserByEmailAction(email).run();
  const userIsValid = !user || user.isOauth;
  if (!userIsValid) {
    throw errors.EMAIL_ALREADY_TAKEN();
  }

  return user;
};
