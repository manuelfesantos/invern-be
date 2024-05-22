import { getUserByEmail } from "@user-db";
import { successResponse } from "@response-entity";
import { User, userToUserDTO } from "@user-entity";
import { errors } from "@error-handling-utils";
import { hashPassword } from "@crypto-utils";
import { loginBodySchema } from "./types/map-user-action";

export const login = async (body: unknown): Promise<Response> => {
  const parsedBody = loginBodySchema.parse(body);

  const { email, password } = parsedBody;

  const user = await getUser(email);

  await validatePassword(password, user);

  return successResponse.OK("successfully logged in", userToUserDTO(user));
};

const getUser = async (email: string): Promise<User> => {
  const user = await getUserByEmail(email);
  if (!user) {
    throw errors.INVALID_CREDENTIALS();
  }
  return user;
};

const validatePassword = async (
  passwordText: string,
  user: User,
): Promise<void> => {
  const password = await hashPassword(passwordText, user.userId);

  if (password !== user.password) {
    throw errors.INVALID_CREDENTIALS();
  }
};
