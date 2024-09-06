import { getRefreshTokenSecret, getTokenSecret, signJwt } from "./index";
import { getFutureDate, TOKEN_EXPIRY } from "@timer-utils";

export const getAnonymousTokens = async (): Promise<{
  token: string;
  refreshToken: string;
}> => {
  return {
    token: await signJwt(
      { exp: getFutureDate(TOKEN_EXPIRY) },
      getTokenSecret(),
    ),
    refreshToken: await signJwt({}, getRefreshTokenSecret()),
  };
};

export const getAnonymousToken = async (): Promise<string> =>
  await signJwt({ exp: getFutureDate(TOKEN_EXPIRY) }, getTokenSecret());
