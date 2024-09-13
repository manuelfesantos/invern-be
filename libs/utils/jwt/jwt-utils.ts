//@ts-expect-error - unable to import from @tsndr/cloudflare-worker-jwt
import jwt from "@tsndr/cloudflare-worker-jwt";
import { JWT, jwtSchema, UserJWT, userJwtSchema } from "@jwt-entity";
import {
  getFutureDate,
  TOKEN_COOKIE_MAX_AGE,
  TOKEN_EXPIRY,
} from "@timer-utils";
import { getRefreshTokenSecret, getTokenSecret } from "./token-secret";
import { base64Decode, base64Encode } from "@crypto-utils";

export const signJwt = async (
  payload: object,
  secretKey: string,
): Promise<string> =>
  base64Encode(
    await jwt.sign({ ...payload }, secretKey, {
      algorithm: "HS512",
    }),
  );

export const verifyJwt = async (
  encodedToken: string,
  secretKey: string,
): Promise<boolean> =>
  await jwt.verify(base64Decode(encodedToken), secretKey, {
    algorithm: "HS512",
  });

export const verifyAccessToken = async (
  encodedToken: string,
): Promise<boolean> => await verifyJwt(encodedToken, getTokenSecret());

export const verifyRefreshToken = async (
  encodedToken: string,
): Promise<boolean> => await verifyJwt(encodedToken, getRefreshTokenSecret());

export const decodeJwt = (encodedToken: string): UserJWT | JWT => {
  const token = base64Decode(encodedToken);
  const tokenPayload = jwt.decode(token).payload;
  const userJwtAttempt = userJwtSchema.safeParse(tokenPayload);
  if (userJwtAttempt.success) {
    return userJwtAttempt.data;
  }
  return jwtSchema.parse(tokenPayload);
};

const typeToCookie = {
  token: "s_a",
  refresh: "s_r",
};

export const getTokenCookie = (
  token: string,
  type: "token" | "refresh",
  remember?: boolean,
): string =>
  `${typeToCookie[type]}=${token}; Path=/; HttpOnly; Secure; Domain=invernspirit.com; SameSite=Strict; ${remember ? `Max-Age=${TOKEN_COOKIE_MAX_AGE}` : ""}`;

export const getLoggedInToken = async (
  userId: string,
  cartId?: string,
  remember?: boolean,
): Promise<string> =>
  await signJwt(
    { userId, cartId, remember, exp: getFutureDate(TOKEN_EXPIRY) },
    getTokenSecret(),
  );

export const getLoggedInRefreshToken = async (
  userId: string,
  cartId?: string,
  remember?: boolean,
): Promise<string> =>
  await signJwt({ userId, cartId, remember }, getRefreshTokenSecret());
