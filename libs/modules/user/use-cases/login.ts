import { getSelectUserByEmailAction, getUpdateUserAction } from "@user-db";
import type { User, UserDTO } from "@user-entity";
import { toUserDTO, UserValidationStatusEnum } from "@user-entity";
import { errors } from "@error-handling-utils";
import { getRandomUUID, hashPassword } from "@crypto-utils";
import { getAuthSecret, setAuthSecret } from "@kv-adapter";
import { getLoggedInRefreshToken, getLoggedInToken } from "@jwt-utils";
import type { ResponseContext } from "@http-entity";
import { contextStore } from "@context-utils";
import { logCredentials } from "@logger-utils";
import type { Cart, ExtendedCart } from "@cart-entity";
import { EMPTY_CART, toCartDTO } from "@cart-entity";
import { extendCart } from "@extender-utils";
import {
  getDeleteCartAction,
  getInsertCartAction,
  getSelectCartByIdAction,
  getUpdateCartAction,
} from "@cart-db";
import * as z from "zod";
import { runBatchOperation } from "@generics-db";

interface ReturnType {
  user: UserDTO;
  responseContext: ResponseContext;
  cart: ExtendedCart;
}

export const loginBodySchema = z.object({
  email: z.email(),
  password: z.string().nonempty(),
  remember: z.boolean().default(false),
});

export const login = async (body: unknown): Promise<ReturnType> => {
  const { isLoggedIn, cartId } = contextStore.context;

  if (isLoggedIn) {
    throw errors.UNAUTHORIZED("already logged in");
  }

  const parsedBody = loginBodySchema.parse(body);

  const { email, password, remember } = parsedBody;

  const user = await getUser(email);

  logCredentials(user.cart?.id, user.id);

  await validatePassword(password, user);

  const { id: userId } = user;

  if (!user.cart) {
    if (cartId) {
      const [, , cart] = await runBatchOperation(
        getUpdateUserAction(userId, { cartId }),
        getUpdateCartAction(cartId, {
          isLoggedIn: true,
        }),
        getSelectCartByIdAction(cartId),
      );

      user.cart = cart ?? (await createCartForUser(userId));
    } else {
      user.cart = await createCartForUser(userId);
    }
  } else {
    if (cartId) {
      await getDeleteCartAction(cartId).run();
    }
  }

  const cart = toCartDTO(user.cart);

  const accessToken = await getLoggedInToken(userId, user.cart.id, user.role);
  let refreshToken = await getAuthSecret(userId);

  if (!refreshToken) {
    refreshToken = await getLoggedInRefreshToken(userId);
    await setAuthSecret(userId, refreshToken);
  }

  return {
    user: toUserDTO(user),
    cart: extendCart(cart),
    responseContext: {
      accessToken,
      refreshToken,
      remember,
    },
  };
};

const createCartForUser = async (userId: string): Promise<Cart> => {
  const cartId = getRandomUUID();
  await runBatchOperation(
    getInsertCartAction({
      isLoggedIn: true,
      id: cartId,
    }),
    getUpdateUserAction(userId, { cartId }),
  );

  return {
    ...EMPTY_CART,
    id: cartId,
  };
};

const getUser = async (email: string): Promise<User> => {
  const user = await getSelectUserByEmailAction(
    email,
    UserValidationStatusEnum.VALIDATED,
  ).run();
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
