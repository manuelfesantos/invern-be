import { signJwt } from "./index";
import { getFutureDate, TOKEN_EXPIRY } from "@timer-utils";
import { ENV } from "@env-utils";

export const getAnonymousTokens = async (): Promise<{
  accessToken: string;
  refreshToken: string;
}> => {
  return {
    accessToken: await signJwt(
      { exp: getFutureDate(TOKEN_EXPIRY) },
      ENV.TOKEN_SECRET,
    ),
    refreshToken: await signJwt({}, ENV.REFRESH_TOKEN_SECRET),
  };
};

export const getAnonymousToken = async (): Promise<string> =>
  await signJwt({ exp: getFutureDate(TOKEN_EXPIRY) }, ENV.TOKEN_SECRET);
