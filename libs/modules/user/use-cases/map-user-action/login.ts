import { getUserByEmail } from "@user-db";
import { protectedSuccessResponse } from "@response-entity";
import { User, userToUserDTO } from "@user-entity";
import { errors } from "@error-handling-utils";
import { hashPassword } from "@crypto-utils";
import { loginBodySchema } from "./types/map-user-action";
import { getAuthSecret, setAuthSecret } from "@kv-adapter";
import { getLoggedInRefreshToken, getLoggedInToken } from "@jwt-utils";

export const login = async (body: unknown, id?: string): Promise<Response> => {
  if (id) {
    throw errors.UNAUTHORIZED("already logged in");
  }
  const parsedBody = loginBodySchema.parse(body);

  const { email, password, remember } = parsedBody;

  const user = await getUser(email);

  await validatePassword(password, user);

  const { id: userId } = user;
  const { id: cartId } = user.cart ?? {};

  const accessToken = await getLoggedInToken(userId, cartId, remember);
  let refreshToken = await getAuthSecret(userId);

  if (!refreshToken) {
    refreshToken = await getLoggedInRefreshToken(userId, cartId);
    await setAuthSecret(userId, refreshToken);
  }

  return protectedSuccessResponse.OK(
    { refreshToken, accessToken },
    "successfully logged in",
    {
      user: userToUserDTO(user),
      accessToken: accessToken,
    },
    remember,
  );
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
  const password = await hashPassword(passwordText, user.id);

  if (password !== user.password) {
    throw errors.INVALID_CREDENTIALS();
  }
};
