import { updateNameBodySchema } from "./types/update-user";
import { getUserById, updateUser } from "@user-db";
import {
  ProtectedModuleFunction,
  protectedSuccessResponse,
} from "@response-entity";
import { User, userToUserDTO } from "@user-entity";

export const updateName: ProtectedModuleFunction = async (
  tokens: { refreshToken: string; accessToken?: string },
  remember: boolean | undefined,
  id: string,
  body: unknown,
) => {
  const { firstName, lastName } = updateNameBodySchema.parse(body);
  const user = await getUserById(id);

  await updateUserWithOptions(user, firstName, lastName);

  return protectedSuccessResponse.OK(
    tokens,
    "user name updated",
    { user: userToUserDTO(mergeUser(user, firstName, lastName)) },
    remember,
  );
};

const updateUserWithOptions = async (
  user: User,
  firstName?: string,
  lastName?: string,
): Promise<void> => {
  if (firstName && lastName) {
    await updateUser(user.id, { firstName, lastName });
  }
  if (firstName) {
    await updateUser(user.id, { firstName });
  }
  if (lastName) {
    await updateUser(user.id, { lastName });
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
