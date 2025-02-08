import { CookieNameEnum } from "@http-entity";
import { getCookies } from "@http-utils";

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

export const getAddressFromHeaders = (headers: Headers): string | undefined => {
  const cookies = getCookies(headers);
  const { [CookieNameEnum.ADDRESS]: address } = cookies;
  return address;
};

export const getUserDetailsFromHeaders = (
  headers: Headers,
): string | undefined => {
  const cookies = getCookies(headers);
  const { [CookieNameEnum.USER_DETAILS]: userDetails } = cookies;
  return userDetails;
};

export const getShippingMethodFromHeaders = (
  headers: Headers,
): string | undefined => {
  const cookies = getCookies(headers);
  const { [CookieNameEnum.SHIPPING_METHOD]: shippingMethod } = cookies;
  return shippingMethod;
};
