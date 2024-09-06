import { protectedSuccessResponse } from "@response-entity";
import { getAnonymousTokens } from "@jwt-utils";
import { errors } from "@error-handling-utils";

export const logout = async (_: unknown, id?: string): Promise<Response> => {
  if (!id) {
    throw errors.UNAUTHORIZED("not logged in");
  }
  const { token, refreshToken } = await getAnonymousTokens();
  return protectedSuccessResponse.OK(
    { refreshToken, accessToken: token },
    "successfully logged out",
    {
      accessToken: token,
    },
  );
};
