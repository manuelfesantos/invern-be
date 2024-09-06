import { protectedSuccessResponse } from "@response-entity";
import { getAnonymousTokens } from "@jwt-utils";

export const loggedOutResponse = async (
  country?: string,
  userVersion?: number,
): Promise<Response> => {
  const { token, refreshToken } = await getAnonymousTokens();

  return protectedSuccessResponse.OK(
    { refreshToken, accessToken: token },
    "success getting logged out config",
    {
      country,
      ...(userVersion ? { deleteUser: true } : {}),
    },
  );
};
