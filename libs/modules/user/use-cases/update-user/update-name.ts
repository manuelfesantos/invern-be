import { updateNameBodySchema } from "./types/update-user";
import { getUserById, updateUser } from "@user-db";
import { successResponse } from "@response-entity";
import { User, userToUserDTO } from "@user-entity";

export const updateName = async (
  id: string,
  body: unknown,
): Promise<Response> => {
  const { firstName, lastName } = updateNameBodySchema.parse(body);
  const user = await getUserById(id);

  await updateUserWithOptions(user, firstName, lastName);

  return successResponse.OK(
    "user name updated",
    userToUserDTO(mergeUser(user, firstName, lastName)),
  );
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
