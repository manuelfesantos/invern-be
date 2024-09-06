import { ResponseWithVersion, updateNameBodySchema } from "./types/update-user";
import { getUserById, updateUser } from "@user-db";
import { protectedSuccessResponse } from "@response-entity";
import { DEFAULT_USER_VERSION, User, userToUserDTO } from "@user-entity";

export const updateName = async (
  tokens: { refreshToken: string; accessToken?: string },
  id: string,
  body: unknown,
  remember?: boolean,
): Promise<ResponseWithVersion> => {
  const { firstName, lastName } = updateNameBodySchema.parse(body);
  const user = await getUserById(id);

  await updateUserWithOptions(user, firstName, lastName);

  return {
    response: protectedSuccessResponse.OK(
      tokens,
      "user name updated",
      { user: userToUserDTO(mergeUser(user, firstName, lastName)) },
      remember,
    ),
    version: user.version || DEFAULT_USER_VERSION,
  };
};

const updateUserWithOptions = async (
  user: User,
  firstName?: string,
  lastName?: string,
): Promise<void> => {
  if (firstName && lastName) {
    await updateUser(user.userId, { firstName, lastName });
  }
  if (firstName) {
    await updateUser(user.userId, { firstName });
  }
  if (lastName) {
    await updateUser(user.userId, { lastName });
  }
};

const mergeUser = (
  user: User,
  firstName?: string,
  lastName?: string,
): User => ({
  ...user,
  ...(firstName && {
    firstName,
  }),
  ...(lastName && {
    lastName,
  }),
});
