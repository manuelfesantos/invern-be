import { getUserByEmail } from "@user-db";
import { User, UserDTO, userToUserDTO } from "@user-entity";
import { errors } from "@error-handling-utils";
import { hashPassword } from "@crypto-utils";
import { loginBodySchema } from "./types/map-user-action";
import { getAuthSecret, setAuthSecret } from "@kv-adapter";
import { getLoggedInRefreshToken, getLoggedInToken } from "@jwt-utils";
import { ResponseContext } from "@http-entity";
import { contextStore } from "@context-utils";
import { logCredentials } from "@logger-utils";
import { ExtendedCart, toCartDTO } from "@cart-entity";
import { extendCart } from "@extender-utils";

interface ReturnType {
  user: UserDTO;
  responseContext: ResponseContext;
  cart: ExtendedCart;
}

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
    throw errors.CART_NOT_FOUND();
  }

  const cart = toCartDTO(user.cart);

  const accessToken = await getLoggedInToken(userId, cartId);
  let refreshToken = await getAuthSecret(userId);

  if (!refreshToken) {
    refreshToken = await getLoggedInRefreshToken(userId);
    await setAuthSecret(userId, refreshToken);
  }

  return {
    user: userToUserDTO(user),
    cart: extendCart(cart),
    responseContext: {
      accessToken,
      refreshToken,
      remember,
    },
  };
};

const getUser = async (email: string): Promise<User> => {
  const user = await getUserByEmail(email);
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
