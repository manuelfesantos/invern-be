import { UserJWT } from "@jwt-entity";
import { loggedInResponse } from "./utils/responses/logged-in-response";
import { loggedOutResponse } from "./utils/responses/logged-out-response";
import { getAuthSecret } from "@kv-adapter";
import { getUserById } from "@user-db";

export const getLoggedInConfig = async (
  headers: Headers,
  refreshToken: string,
  tokenPayload: UserJWT,
  remember?: boolean,
): Promise<Response> => {
  const { userId } = tokenPayload;

  let cartId: string | undefined = undefined;

  if (userId) {
    const user = await getUserById(userId);
    cartId = user?.cart?.id;
  }

  const authSecret = await getAuthSecret(userId);

  if (!authSecret || authSecret !== refreshToken) {
    return loggedOutResponse(headers);
  }

  return await loggedInResponse(
    headers,
    userId,
    refreshToken,
    cartId,
    remember,
  );
};
