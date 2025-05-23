import { getSelectUserByEmailAction, getUpdateUserAction } from "@user-db";
import {
  User,
  UserDTO,
  toUserDTO,
  UserValidationStatusEnum,
} from "@user-entity";
import { errors } from "@error-handling-utils";
import { getRandomUUID, hashPassword } from "@crypto-utils";
import { getAuthSecret, setAuthSecret } from "@kv-adapter";
import { getLoggedInRefreshToken, getLoggedInToken } from "@jwt-utils";
import { ResponseContext } from "@http-entity";
import { contextStore } from "@context-utils";
import { logCredentials } from "@logger-utils";
import { EMPTY_CART, ExtendedCart, toCartDTO } from "@cart-entity";
import { extendCart } from "@extender-utils";
import { getInsertCartAction } from "@cart-db";
import { z } from "zod";
import { emailSchema, requiredStringSchema } from "@global-entity";

interface ReturnType {
  user: UserDTO;
  responseContext: ResponseContext;
  cart: ExtendedCart;
}

export const loginBodySchema = z.object({
  email: emailSchema("user mail"),
  password: requiredStringSchema("user password"),
  remember: z.boolean().default(false),
});

export const login = async (body: unknown): Promise<ReturnType> => {
  const { isLoggedIn } = contextStore.context;

  if (isLoggedIn) {
    throw errors.UNAUTHORIZED("already logged in");
  }

  const parsedBody = loginBodySchema.parse(body);

  const { email, password, remember } = parsedBody;

  const user = await getUser(email);

  await validatePassword(password, user);

  const { id: userId } = user;
  const { id: cartId } = user.cart ?? {};

  logCredentials(cartId, userId);

  if (!user.cart) {
    const newCartId = getRandomUUID();
    await getInsertCartAction({
      isLoggedIn: true,
      id: newCartId,
    }).run();

    await getUpdateUserAction(userId, { cartId: newCartId }).run();

    user.cart = {
      ...EMPTY_CART,
      id: newCartId,
    };
  }

  const cart = toCartDTO(user.cart);

  const accessToken = await getLoggedInToken(userId, cartId);
  let refreshToken = await getAuthSecret(userId);

  if (!refreshToken) {
    refreshToken = await getLoggedInRefreshToken(userId);
    await setAuthSecret(userId, refreshToken);
  }

  return {
    user: toUserDTO(user),
    cart: extendCart(cart),
    responseContext: {
      accessToken,
      refreshToken,
      remember,
    },
  };
};

const getUser = async (email: string): Promise<User> => {
  const user = await getSelectUserByEmailAction(
    email,
    UserValidationStatusEnum.VALIDATED,
  ).run();
  if (!user) {
    throw errors.INVALID_CREDENTIALS();
  }
  return user;
};

const validatePassword = async (
  passwordText: string,
  user: User,
): Promise<void> => {
  const password = await hashPassword(passwordText, user.id);

  if (password !== user.password) {
    throw errors.INVALID_CREDENTIALS();
  }
};
