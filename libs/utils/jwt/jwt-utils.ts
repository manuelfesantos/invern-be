import { JWT, jwtSchema, UserJWT, userJwtSchema } from "@jwt-entity";
import {
  getFutureDate,
  TOKEN_COOKIE_MAX_AGE,
  TOKEN_EXPIRY,
} from "@timer-utils";
import { getRefreshTokenSecret, getTokenSecret } from "./token-secret";
import { decrypt, encrypt } from "@crypto-utils";
import { CookieNameEnum } from "@http-entity";
import { getDomain } from "@http-utils";

export const signJwt = async (
  payload: object,
  secretKey: string,
): Promise<string> =>
  encrypt(
    await import("@tsndr/cloudflare-worker-jwt").then((jwt) =>
      jwt.sign({ ...payload }, secretKey, {
        algorithm: "HS512",
      }),
    ),
  );

export const verifyJwt = async (
  encodedToken: string,
  secretKey: string,
): Promise<boolean> =>
  await import("@tsndr/cloudflare-worker-jwt").then(async (jwt) =>
    jwt.verify(await decrypt(encodedToken), secretKey, {
      algorithm: "HS512",
    }),
  );

export const verifyAccessToken = async (
  encodedToken: string,
): Promise<boolean> => await verifyJwt(encodedToken, getTokenSecret());

export const verifyRefreshToken = async (
  encodedToken: string,
): Promise<boolean> => await verifyJwt(encodedToken, getRefreshTokenSecret());

export const decodeJwt = async (
  encodedToken: string,
): Promise<UserJWT | JWT> => {
  const token = await decrypt(encodedToken);
  const tokenPayload = (await import("@tsndr/cloudflare-worker-jwt")).decode(
    token,
  ).payload;
  const userJwtAttempt = userJwtSchema.safeParse(tokenPayload);
  if (userJwtAttempt.success) {
    return userJwtAttempt.data;
  }
  return jwtSchema.parse(tokenPayload);
};

export const getTokenCookie = (token: string, remember?: boolean): string =>
  `${CookieNameEnum.REFRESH_TOKEN}=${token}; Path=/; HttpOnly; Secure; Domain=${getDomain()}; SameSite=Strict; ${remember ? `Max-Age=${TOKEN_COOKIE_MAX_AGE}` : ""}`;

export const getLoggedInToken = async (
  userId: string,
  cartId?: string,
): Promise<string> =>
  await signJwt(
    { userId, cartId, exp: getFutureDate(TOKEN_EXPIRY) },
    getTokenSecret(),
  );

export const getLoggedInRefreshToken = async (
  userId: string,
): Promise<string> => await signJwt({ userId }, getRefreshTokenSecret());
