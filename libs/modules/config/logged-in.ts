import { UserJWT } from "@jwt-entity";
import { loggedInResponse } from "./utils/responses/logged-in-response";
import { loggedOutResponse } from "./utils/responses/logged-out-response";
import { getAuthSecret } from "@kv-adapter";

const DUMMY_USER_VERSION = 1;

export const getLoggedInConfig = async (
  refreshToken: string,
  tokenPayload: UserJWT,
  country?: string,
  userVersion?: number,
  remember?: boolean,
): Promise<Response> => {
  if (!userVersion) {
    return loggedOutResponse(country, DUMMY_USER_VERSION);
  }

  const { userId, cartId } = tokenPayload;

  const authSecret = await getAuthSecret(userId);

  if (!authSecret || authSecret !== refreshToken) {
    return loggedOutResponse(country, DUMMY_USER_VERSION);
  }

  return await loggedInResponse(
    userId,
    userVersion,
    refreshToken,
    country,
    cartId,
    remember,
  );
};
