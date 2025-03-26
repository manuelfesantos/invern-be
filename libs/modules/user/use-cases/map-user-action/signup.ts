import { signupBodySchema } from "./types/map-user-action";
import { insertUser, selectUserByEmail, selectUserById } from "@user-db";
import { insertCart, updateCart } from "@cart-db";
import { errors } from "@error-handling-utils";
import { UserDTO, userToUserDTO } from "@user-entity";
import { setAuthSecret } from "@kv-adapter";
import { getLoggedInRefreshToken, getLoggedInToken } from "@jwt-utils";
import { ResponseContext } from "@http-entity";
import { contextStore } from "@context-utils";
import { ExtendedCart, toCartDTO } from "@cart-entity";
import { extendCart } from "@extender-utils";
import { localLogger } from "@logger-utils";
import { withTransaction } from "@db";

interface ReturnType {
  user: UserDTO;
  responseContext: ResponseContext;
  cart: ExtendedCart;
}

export const signup = withTransaction(
  async (body: unknown): Promise<ReturnType> => {
    const { isLoggedIn, cartId } = contextStore.context;

    localLogger.info("signup", { isLoggedIn, cartId });

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
      cartId: contextStore.context.cartId,
    });
    const user = await selectUserById(userId);

    const refreshToken = await getLoggedInRefreshToken(userId);
    await setAuthSecret(userId, refreshToken);

    const accessToken = await getLoggedInToken(
      userId,
      contextStore.context.cartId,
    );

    const { cart } = user;

    if (!cart) {
      throw errors.CART_NOT_FOUND();
    }

    return {
      cart: extendCart(toCartDTO(cart)),
      user: userToUserDTO(user),
      responseContext: { refreshToken, accessToken, remember },
    };
  },
);

const validateThatEmailIsUnique = async (email: string): Promise<void> => {
  const userExists = Boolean(await selectUserByEmail(email));
  if (userExists) {
    throw errors.EMAIL_ALREADY_TAKEN();
  }
};
