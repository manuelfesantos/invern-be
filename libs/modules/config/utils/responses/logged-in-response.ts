import { getUserById, getUserVersionById } from "@user-db";
import { protectedSuccessResponse } from "@response-entity";
import { getLoggedInToken } from "@jwt-utils";
import { loggedOutResponse } from "./logged-out-response";
import { userDTOSchema } from "@user-entity";

export const loggedInResponse = async (
  userId: string,
  userVersion: number,
  refreshToken: string,
  country?: string,
  cartId?: string,
  remember?: boolean,
): Promise<Response> => {
  const savedUserVersion = await getUserVersionById(userId);

  if (!savedUserVersion) {
    return loggedOutResponse(country, userVersion);
  }

  const accessToken = await getLoggedInToken(userId, cartId, remember);

  if (userVersion === savedUserVersion) {
    return protectedSuccessResponse.OK(
      { refreshToken, accessToken },
      "success getting logged in config",
      {
        country,
      },
      remember,
    );
  }

  if (userVersion > savedUserVersion) {
    return loggedOutResponse(country, userVersion);
  }

  const user = await getUserById(userId);

  if (!user) {
    return loggedOutResponse(country, userVersion);
  }

  return protectedSuccessResponse.OK(
    { refreshToken, accessToken },
    "success getting logged in config",
    {
      country,
      user: userDTOSchema.parse(user),
    },
    remember,
  );
};
