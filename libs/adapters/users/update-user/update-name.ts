import { getUserById } from "@adapters/users/get-user";
import { getDb } from "@adapters/db";
import { User, userToUserDTO } from "@entities/user/user-entity";

export const updateName = async (
  id: string,
  firstName?: string,
  lastName?: string,
) => {
  const user = await getUserById(id);

  const updateOptions = getUpdateOptions(firstName, lastName);

  await runQuery(id, updateOptions);

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

const runQuery = async (id: string, updateOptions: string) => {
  const db = getDb();
  await db
    .prepare(`UPDATE users SET ${updateOptions} WHERE id = ?`)
    .bind(id)
    .run();
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
