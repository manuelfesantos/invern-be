import {
  decodeJwt,
  getLoggedInToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../jwt-utils";
import { errors } from "@error-handling-utils";
import { getAnonymousToken } from "../get-anonymous-tokens";
import { UserJWT } from "@jwt-entity";
import {
  getAddressFromHeaders,
  getRememberValue,
  getShippingMethodFromHeaders,
  getTokensFromHeaders,
  getUserDetailsFromHeaders,
} from "./utils";
import { getCartIdFromHeaders } from "@http-utils";
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

const handleLoggedInToken = (
  headers: Headers,
  token: UserJWT,
  refreshToken: string,
): Credentials => {
  const remember = getRememberValue(headers);
  const { userId, cartId } = token;
  const { address, userDetails, shippingMethod } =
    getCheckoutCredentialsFromHeaders(headers);

  return {
    userId,
    cartId,
    refreshToken,
    remember,
    address,
    userDetails,
    shippingMethod,
  };
};

const handleLoggedOutToken = async (
  headers: Headers,
  refreshToken: string,
): Promise<Credentials> => {
  const cartId = getCartIdFromHeaders(headers);
  const { address, userDetails, shippingMethod } =
    getCheckoutCredentialsFromHeaders(headers);
  return { refreshToken, cartId, address, userDetails, shippingMethod };
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
  const { address, userDetails, shippingMethod } =
    getCheckoutCredentialsFromHeaders(headers);

  if (!cart) {
    cart = await insertCartReturningAll({ isLoggedIn: true });
    await updateUser(userId, { cartId: cart.id });
  }

  const accessToken = await getLoggedInToken(userId, cart.id);
  return {
    userId,
    cartId: cart.id,
    accessToken,
    refreshToken,
    remember,
    address,
    userDetails,
    shippingMethod,
  };
};

const handleLoggedOutRefreshToken = async (
  headers: Headers,
  refreshToken: string,
): Promise<Credentials> => {
  const accessToken = await getAnonymousToken();
  const cartId = getCartIdFromHeaders(headers);
  const { address, userDetails, shippingMethod } =
    getCheckoutCredentialsFromHeaders(headers);
  return {
    accessToken,
    refreshToken,
    cartId,
    address,
    userDetails,
    shippingMethod,
  };
};

const getCheckoutCredentialsFromHeaders = (
  headers: Headers,
): { address?: string; userDetails?: string; shippingMethod?: string } => {
  const address = getAddressFromHeaders(headers);
  const userDetails = getUserDetailsFromHeaders(headers);
  const shippingMethod = getShippingMethodFromHeaders(headers);
  return { address, userDetails, shippingMethod };
};
