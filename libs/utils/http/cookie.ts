import { parse } from "cookie";
import { CookieName, CookieNameEnum, HttpHeaderEnum } from "@http-entity";
import { getFutureDate, NO_MAX_AGE, TOKEN_COOKIE_MAX_AGE } from "@timer-utils";
import { getDomain } from "./request.utils";

export const getCookieHeader = (
  name: CookieName,
  value: string,
  maxAge?: number,
  isSecure: boolean = true,
  isHttpOnly: boolean = true,
  isSameSite: boolean = true,
  domain?: string,
  path: string = "/",
): string =>
  `${name}=${value}; ${maxAge !== undefined ? `Max-Age=${maxAge}` : ""}; ${isSecure ? "Secure;" : ""} ${isHttpOnly ? "HttpOnly;" : ""} ${isSameSite ? "SameSite=Strict;" : ""} Domain=${domain || getDomain()}; ${path ? `Path=${path};` : ""}`;

export const getTokensFromHeaders = (
  headers: Headers,
): { token?: string; refreshToken?: string } => {
  const token = headers.get("Authorization")?.replace("Bearer ", "");
  const cookies = getCookies(headers);
  const { [CookieNameEnum.REFRESH_TOKEN]: refreshToken } = cookies;
  return { token, refreshToken };
};

export const getRememberValue = (headers: Headers): boolean => {
  const cookies = getCookies(headers);
  const { [CookieNameEnum.REMEMBER]: remember } = cookies;
  return remember === "true";
};

export const getCartIdFromHeaders = (headers: Headers): string | undefined => {
  const cookies = getCookies(headers);
  const { [CookieNameEnum.CART_ID]: cartId } = cookies;
  return cartId;
};

export const getAddressFromHeaders = (headers: Headers): string | undefined => {
  const cookies = getCookies(headers);
  const { [CookieNameEnum.ADDRESS]: address } = cookies;
  return address;
};

export const getCookies = (
  headers: Headers,
): Record<string, string | undefined> =>
  parse(headers.get(HttpHeaderEnum.COOKIE) ?? "");

export const getCartIdCookieHeader = (cartId: string): string =>
  getCookieHeader(
    CookieNameEnum.CART_ID,
    cartId,
    getFutureDate(TOKEN_COOKIE_MAX_AGE),
  );

export const getRememberCookieHeader = (): string =>
  getCookieHeader(
    CookieNameEnum.REMEMBER,
    "true",
    getFutureDate(TOKEN_COOKIE_MAX_AGE),
  );

export const deleteCookieHeader = (cookieName: CookieName): string =>
  getCookieHeader(cookieName, "", NO_MAX_AGE);

export const setCartIdCookieInResponse = (
  response: Response,
  cartId: string,
): void => setCookieInResponse(response, getCartIdCookieHeader(cartId));

export const deleteCookieFromResponse = (
  response: Response,
  cookieName: CookieName,
): void => setCookieInResponse(response, deleteCookieHeader(cookieName));

export const setCookieInResponse = (response: Response, cookie: string): void =>
  response.headers.append("Set-Cookie", cookie);
