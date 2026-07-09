import {
  decodeJwt,
  getLoggedInToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../jwt-utils";
import { errors } from "@error-handling-utils";
import { getAnonymousToken } from "../get-anonymous-tokens";
import type { UserJWT } from "@jwt-entity";
import {
  getAddressFromHeaders,
  getCustomerEmailFromHeaders,
  getRememberValue,
  getShippingMethodFromHeaders,
  getTokensFromHeaders,
  getUserDetailsFromHeaders,
} from "./utils";
import { getCartIdFromHeaders } from "@http-utils";
/* eslint-disable import/no-restricted-paths */
import { getAuthSecret } from "@kv-adapter";
import { getSelectUserByIdAction, getUpdateUserAction } from "@user-db";
import { getInsertCartAction } from "@cart-db";
/* eslint-enable import/no-restricted-paths */
import type { Credentials } from "@request-entity";
import { getRandomUUID } from "@crypto-utils";

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
  const { userId, cartId, role } = token;
  const { address, userDetails, shippingMethod, customerEmail } =
    getCheckoutCredentialsFromHeaders(headers);

  return {
    userId,
    cartId,
    role,
    customerEmail,
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
  const { address, userDetails, shippingMethod, customerEmail } =
    getCheckoutCredentialsFromHeaders(headers);
  return {
    refreshToken,
    cartId,
    address,
    userDetails,
    shippingMethod,
    customerEmail,
  };
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

  const user = await getSelectUserByIdAction(userId).run();

  if (!user) {
    throw errors.UNAUTHORIZED();
  }

  // A disabled account can't refresh into a new access token (admin disable is
  // honored here as well as at login).
  if (user.disabled) {
    throw errors.UNAUTHORIZED();
  }

  let { id: cartId } = user.cart || {};
  const { address, userDetails, shippingMethod, customerEmail } =
    getCheckoutCredentialsFromHeaders(headers);

  if (!cartId) {
    cartId = getRandomUUID();
    await getInsertCartAction({ isLoggedIn: true, id: cartId }).run();
    await getUpdateUserAction(userId, { cartId: cartId }).run();
  }

  const accessToken = await getLoggedInToken(userId, cartId, user.role);
  return {
    userId,
    cartId: cartId,
    role: user.role,
    accessToken,
    customerEmail,
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
  const { address, userDetails, shippingMethod, customerEmail } =
    getCheckoutCredentialsFromHeaders(headers);
  return {
    accessToken,
    refreshToken,
    cartId,
    address,
    userDetails,
    shippingMethod,
    customerEmail,
  };
};

const getCheckoutCredentialsFromHeaders = (
  headers: Headers,
): {
  address?: string;
  userDetails?: string;
  shippingMethod?: string;
  customerEmail?: string;
} => {
  const address = getAddressFromHeaders(headers);
  const userDetails = getUserDetailsFromHeaders(headers);
  const shippingMethod = getShippingMethodFromHeaders(headers);
  const customerEmail = getCustomerEmailFromHeaders(headers);
  return { address, userDetails, shippingMethod, customerEmail };
};
