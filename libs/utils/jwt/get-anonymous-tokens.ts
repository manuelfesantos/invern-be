import { getRefreshTokenSecret, getTokenSecret, signJwt } from "./index";
import { getFutureDate, TOKEN_EXPIRY } from "@timer-utils";

export const getAnonymousTokens = async (): Promise<{
  accessToken: string;
  refreshToken: string;
}> => {
  return {
    accessToken: await signJwt(
      { exp: getFutureDate(TOKEN_EXPIRY) },
      getTokenSecret(),
    ),
    refreshToken: await signJwt({}, getRefreshTokenSecret()),
  };
};

export const getAnonymousToken = async (): Promise<string> =>
  await signJwt({ exp: getFutureDate(TOKEN_EXPIRY) }, getTokenSecret());
