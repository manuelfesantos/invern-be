import { parse } from "cookie";
import {
  decodeJwt,
  getLoggedInToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "./jwt-utils";
import { errors } from "@error-handling-utils";
import { getAuthSecret } from "@kv-adapter";
import { getAnonymousToken } from "./get-anonymous-tokens";
import { HttpHeaderEnum } from "@http-entity";

export const getCredentials = async (
  headers: Headers,
): Promise<{
  userId?: string;
  cartId?: string;
  accessToken?: string;
  refreshToken: string;
  remember?: boolean;
}> => {
  try {
    const { token, refreshToken } = getTokensFromHeaders(headers);
    if (!refreshToken || !token) {
      throw errors.UNAUTHORIZED();
    }

    const tokenIsValid = await verifyAccessToken(token);
    if (tokenIsValid) {
      const tokenPayload = decodeJwt(token);
      if ("userId" in tokenPayload) {
        const { userId, cartId, remember } = tokenPayload;
        return { userId, cartId, refreshToken, remember };
      }
      return { refreshToken };
    }
    const refreshTokenIsValid = await verifyRefreshToken(refreshToken);
    if (!refreshTokenIsValid) {
      throw errors.UNAUTHORIZED();
    }
    const refreshTokenPayload = decodeJwt(refreshToken);
    if ("userId" in refreshTokenPayload) {
      const { userId, cartId, remember } = refreshTokenPayload;
      const userAuth = await getAuthSecret(userId);

      if (!userAuth || userAuth !== refreshToken) {
        throw errors.UNAUTHORIZED();
      }
      const accessToken = await getLoggedInToken(userId, cartId, remember);
      return { userId, cartId, accessToken, refreshToken, remember };
    }
    const accessToken = await getAnonymousToken();
    return { accessToken, refreshToken };
  } catch (error) {
    if (error instanceof Error) {
      throw errors.UNAUTHORIZED(error.message);
    }
    throw error;
  }
};

const getTokensFromHeaders = (
  headers: Headers,
): { token?: string; refreshToken?: string } => {
  const token = headers.get("Authorization")?.replace("Bearer ", "");
  const cookies = parse(headers.get(HttpHeaderEnum.COOKIE) ?? "");
  const { s_r: refreshToken } = cookies;
  return { token, refreshToken };
};
