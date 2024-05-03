import { updateNameBodySchema } from "../../types/update-user";
import { getUserById, updateUser } from "@user-adapter";
import { successResponse } from "@response-entity";
import { User, userToUserDTO } from "@user-entity";

export const updateName = async (
  id: string,
  body: unknown,
): Promise<Response> => {
  const { firstName, lastName } = updateNameBodySchema.parse(body);
  const user = await getUserById(id);

  const updateOptions = getUpdateOptions(firstName, lastName);

  await updateUser(id, updateOptions);

  return successResponse.OK(
    "user name updated",
    userToUserDTO(mergeUser(user, firstName, lastName)),
  );
};

const getUpdateOptions = (firstName?: string, lastName?: string): string => {
  let updateOptions = "";
  if (firstName && lastName) {
    updateOptions = `firstName = '${firstName}', lastName = '${lastName}'`;
  } else if (firstName) {
    updateOptions = `firstName = '${firstName}'`;
  } else if (lastName) {
    updateOptions = `lastName = '${lastName}'`;
  }
  return updateOptions;
};

const mergeUser = (
  user: User,
  firstName?: string,
  lastName?: string,
): User => ({
  ...user,
  ...(firstName && {
    firstName: firstName,
  }),
  ...(lastName && {
    lastName: lastName,
  }),
});
