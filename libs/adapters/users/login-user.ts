import { getUserByEmail } from "@adapters/users/get-user";
import { hash } from "@utils/crypto";
import { errors } from "@utils/error-handling/error-messages";
import { User, userToUserDTO } from "@entities/user/user-entity";

export const loginUser = async (email: string, password: string) => {
  const user = await getUser(email);

  await validatePassword(password, user);

  return userToUserDTO(user);
};

const getUser = async (email: string) => {
  const user = await getUserByEmail(email);
  if (!user) {
    throw errors.INVALID_CREDENTIALS;
  }
  return user;
};

const validatePassword = async (passwordText: string, user: User) => {
  const passwordHash = await hash(passwordText, user.id);
  if (passwordHash !== user.password) {
    throw errors.INVALID_CREDENTIALS;
  }
};
