import {
  decodeJwt,
  getLoggedInToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "./jwt-utils";
import { errors } from "@error-handling-utils";
import { getAnonymousToken } from "./get-anonymous-tokens";
import { logger } from "@logger-utils";
import { UserJWT } from "@jwt-entity";
import {
  getCartIdFromHeaders,
  getRememberValue,
  getTokensFromHeaders,
} from "@http-utils";
/* eslint-disable import/no-restricted-paths */
import { getAuthSecret } from "@kv-adapter";
import { getUserById, updateUser } from "@user-db";
import { insertCartReturningAll } from "@cart-db";
/* eslint-enable import/no-restricted-paths */
import { Credentials } from "@request-entity";

export const getCredentials = async (
  headers: Headers,
): Promise<Credentials> => {
  try {
    const { token, refreshToken } = getTokensFromHeaders(headers);

    if (!refreshToken || !token) {
      throw errors.UNAUTHORIZED();
    }

    const tokenIsValid = await verifyAccessToken(token);
    if (tokenIsValid) {
      const tokenPayload = await decodeJwt(token);
      if ("userId" in tokenPayload) {
        return handleLoggedInToken(headers, tokenPayload, refreshToken);
      }
      return handleLoggedOutToken(headers, refreshToken);
    }
    const refreshTokenIsValid = await verifyRefreshToken(refreshToken);
    if (!refreshTokenIsValid) {
      throw errors.UNAUTHORIZED();
    }
    const refreshTokenPayload = await decodeJwt(refreshToken);
    if ("userId" in refreshTokenPayload) {
      return await handleLoggedInRefreshToken(
        refreshTokenPayload,
        headers,
        refreshToken,
      );
    }
    return await handleLoggedOutRefreshToken(headers, refreshToken);
  } catch (error) {
    if (error instanceof Error) {
      throw errors.UNAUTHORIZED(error.message);
    }
    throw error;
  }
};

const logCredentials = (cartId?: string, userId?: string): void => {
  logger().addRedactedData({
    ...(cartId && { cartId }),
    ...(userId && { userId }),
  });
};

const handleLoggedInToken = (
  headers: Headers,
  token: UserJWT,
  refreshToken: string,
): Credentials => {
  const remember = getRememberValue(headers);
  const { userId, cartId } = token;

  logCredentials(cartId, userId);

  return { userId, cartId, refreshToken, remember };
};

const handleLoggedOutToken = async (
  headers: Headers,
  refreshToken: string,
): Promise<Credentials> => {
  const cartId = getCartIdFromHeaders(headers);
  return { refreshToken, cartId };
};

const handleLoggedInRefreshToken = async (
  refreshTokenPayload: UserJWT,
  headers: Headers,
  refreshToken: string,
): Promise<Credentials> => {
  const remember = getRememberValue(headers);
  const { userId } = refreshTokenPayload;
  const userAuth = await getAuthSecret(userId);

  if (!userAuth || userAuth !== refreshToken) {
    throw errors.UNAUTHORIZED();
  }

  let { cart } = await getUserById(userId);

  if (!cart) {
    cart = await insertCartReturningAll({ isLoggedIn: true });
    await updateUser(userId, { cartId: cart.id });
  }

  logCredentials(cart.id, userId);

  const accessToken = await getLoggedInToken(userId, cart.id);
  return { userId, cartId: cart.id, accessToken, refreshToken, remember };
};

const handleLoggedOutRefreshToken = async (
  headers: Headers,
  refreshToken: string,
): Promise<Credentials> => {
  const accessToken = await getAnonymousToken();
  const cartId = getCartIdFromHeaders(headers);
  return { accessToken, refreshToken, cartId };
};
