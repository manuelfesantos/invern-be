import type { JWT, UserJWT } from "@jwt-entity";
import { jwtSchema, userJwtSchema } from "@jwt-entity";
import type { Role } from "@user-entity";
import {
  getFutureDate,
  REFRESH_TOKEN_EXPIRY,
  TOKEN_COOKIE_MAX_AGE,
  TOKEN_EXPIRY,
} from "@timer-utils";
import { decrypt, encrypt } from "@crypto-utils";
import { CookieNameEnum } from "@http-entity";
import jwt from "@tsndr/cloudflare-worker-jwt";
import { ENV } from "@env-utils";

export const signJwt = async (
  payload: object,
  secretKey: string,
): Promise<string> =>
  encrypt(
    await jwt.sign({ ...payload }, secretKey, {
      algorithm: "HS512",
    }),
  );

export const verifyJwt = async (
  encodedToken: string,
  secretKey: string,
): Promise<boolean> =>
  Boolean(
    await jwt.verify(await decrypt(encodedToken), secretKey, {
      algorithm: "HS512",
    }),
  );

export const verifyAccessToken = async (
  encodedToken: string,
): Promise<boolean> => await verifyJwt(encodedToken, ENV.TOKEN_SECRET);

export const verifyRefreshToken = async (
  encodedToken: string,
): Promise<boolean> => await verifyJwt(encodedToken, ENV.REFRESH_TOKEN_SECRET);

export const decodeJwt = async (
  encodedToken: string,
): Promise<UserJWT | JWT> => {
  const token = await decrypt(encodedToken);
  const tokenPayload = jwt.decode(token).payload;
  const userJwtAttempt = userJwtSchema.safeParse(tokenPayload);
  if (userJwtAttempt.success) {
    return userJwtAttempt.data;
  }
  return jwtSchema.parse(tokenPayload);
};

export const getTokenCookie = (token: string, remember?: boolean): string => {
  const isLocal = ENV.ENV === "local";
  // Local: host-only cookie (no Domain) with SameSite=None so the backoffice
  // (localhost:5173) sends it cross-origin to the API (localhost:8790) — browsers
  // reject `Domain=localhost`. Prod: the real Domain to share across subdomains.
  const domain = isLocal ? "" : `Domain=${ENV.DOMAIN}; `;
  const sameSite = isLocal ? "SameSite=None;" : "SameSite=Strict;";
  return `${CookieNameEnum.REFRESH_TOKEN}=${token}; Path=/; HttpOnly; Secure; ${domain}${sameSite} ${remember ? `Max-Age=${TOKEN_COOKIE_MAX_AGE}` : ""}`;
};

export const getLoggedInToken = async (
  userId: string,
  cartId?: string,
  role?: Role,
): Promise<string> =>
  await signJwt(
    { userId, cartId, role, exp: getFutureDate(TOKEN_EXPIRY) },
    ENV.TOKEN_SECRET,
  );

export const getLoggedInRefreshToken = async (
  userId: string,
): Promise<string> =>
  await signJwt(
    { userId, exp: getFutureDate(REFRESH_TOKEN_EXPIRY) },
    ENV.REFRESH_TOKEN_SECRET,
  );
