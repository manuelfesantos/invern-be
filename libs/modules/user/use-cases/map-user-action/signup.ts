import { signupBodySchema } from "./types/map-user-action";
import { insertUser, getUserByEmail, getUserById } from "@user-db";
import { insertCart } from "@cart-db";
import { protectedSuccessResponse } from "@response-entity";
import { errors } from "@error-handling-utils";
import { userToUserDTO } from "@user-entity";
import { setAuthSecret } from "@kv-adapter";
import { getLoggedInRefreshToken, getLoggedInToken } from "@jwt-utils";

export const signup = async (body: unknown, id?: string): Promise<Response> => {
  if (id) {
    throw errors.UNAUTHORIZED("already logged in");
  }
  const parsedBody = signupBodySchema.parse(body);

  const { remember } = parsedBody;

  await validateThatEmailIsUnique(parsedBody.email);
  const [{ cartId }] = await insertCart();
  const [{ userId }] = await insertUser({
    ...parsedBody,
    cartId,
  });
  const user = await getUserById(userId);

  const refreshToken = await getLoggedInRefreshToken(userId, cartId);
  await setAuthSecret(userId, refreshToken);

  const accessToken = await getLoggedInToken(userId, cartId, remember);

  return protectedSuccessResponse.CREATED(
    { refreshToken, accessToken },
    "user created",
    {
      user: userToUserDTO(user),
      accessToken: accessToken,
    },
    remember,
  );
};

const validateThatEmailIsUnique = async (email: string): Promise<void> => {
  const userExists = Boolean(await getUserByEmail(email));
  if (userExists) {
    throw errors.EMAIL_ALREADY_TAKEN();
  }
};
