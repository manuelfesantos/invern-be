import { signupBodySchema } from "./types/map-user-action";
import { insertUser, getUserByEmail, getUserById } from "@user-db";
import { insertCart, updateCart } from "@cart-db";
import { errors } from "@error-handling-utils";
import { UserDTO, userToUserDTO } from "@user-entity";
import { setAuthSecret } from "@kv-adapter";
import { getLoggedInRefreshToken, getLoggedInToken } from "@jwt-utils";
import { ResponseContext } from "@http-entity";
import { contextStore } from "@context-utils";

interface ReturnType {
  user: UserDTO;
  responseContext: ResponseContext;
}

export const signup = async (body: unknown): Promise<ReturnType> => {
  const { isLoggedIn, cartId } = contextStore.context;

  if (isLoggedIn) {
    throw errors.UNAUTHORIZED("already logged in");
  }

  const parsedBody = signupBodySchema.parse(body);

  const { remember } = parsedBody;

  await validateThatEmailIsUnique(parsedBody.email);

  if (!cartId) {
    const [{ cartId: newCartId }] = await insertCart({ isLoggedIn: true });
    contextStore.context.cartId = newCartId;
  } else {
    await updateCart(cartId, { isLoggedIn: true });
  }

  const [{ userId }] = await insertUser({
    ...parsedBody,
    cartId,
  });
  const user = await getUserById(userId);

  const refreshToken = await getLoggedInRefreshToken(userId);
  await setAuthSecret(userId, refreshToken);

  const accessToken = await getLoggedInToken(userId, cartId);

  return {
    user: userToUserDTO(user),
    responseContext: { refreshToken, accessToken, remember },
  };
};

const validateThatEmailIsUnique = async (email: string): Promise<void> => {
  const userExists = Boolean(await getUserByEmail(email));
  if (userExists) {
    throw errors.EMAIL_ALREADY_TAKEN();
  }
};
