import { getUserById } from "@adapters/user/get-user";
import { User, userToUserDTO } from "@entities/user/user-entity";
import { updateUser } from "@adapters/user/update-user";

export const updateName = async (
  id: string,
  firstName?: string,
  lastName?: string,
) => {
  const user = await getUserById(id);

  const updateOptions = getUpdateOptions(firstName, lastName);

  await updateUser(id, updateOptions);

  return userToUserDTO(mergeUser(user, firstName, lastName));
};

const getUpdateOptions = (firstName?: string, lastName?: string) => {
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

const mergeUser = (user: User, firstName?: string, lastName?: string) => ({
  ...user,
  ...(firstName && {
    firstName: firstName,
  }),
  ...(lastName && {
    lastName: lastName,
  }),
});
