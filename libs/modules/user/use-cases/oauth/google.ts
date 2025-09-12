import type { InsertUser, User } from "@user-entity";
import { userSchema } from "@user-entity";
import { getRandomUUID, hashString } from "@crypto-utils";
import { logCredentials, logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import {
  getInsertUserAction,
  getSelectUserByEmailAction,
  getSelectUserByGoogleUserIdAction,
  getSelectUserByIdAction,
  getUpdateUserAction,
} from "@user-db";
import { getAuthSecret, setAuthSecret } from "@kv-adapter";
import { getLoggedInRefreshToken } from "@jwt-utils";
import {
  getDeleteCartAction,
  getInsertCartAction,
  getUpdateCartAction,
} from "@cart-db";
import { runBatchOperation } from "@generics-db";
import { contextStore } from "@context-utils";

const FIRST_NAME = 0;
const LAST_NAME = 1;

interface GoogleUserResponse {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export const getGoogleOauthUser = async (
  googleUser: GoogleUserResponse,
): Promise<{ user: User; refreshToken: string; isNewUser: boolean }> => {
  const { cartId } = contextStore.context;
  const hashedGoogleUserId = await hashString(googleUser.id);

  logger().info("user from google", {
    useCase: LoggerUseCaseEnum.OAUTH_GOOGLE_CALLBACK,
    data: {
      googleUser: { ...googleUser, id: hashedGoogleUserId },
    },
  });

  const dbUser = await getSelectUserByEmailAction(googleUser.email).run();
  if (dbUser) {
    if (!dbUser.googleUserId) {
      await getUpdateUserAction(dbUser.id, {
        googleUserId: hashedGoogleUserId,
      }).run();
    }

    await syncCartWithUser(dbUser);

    const refreshToken = await getRefreshToken(dbUser);

    return {
      isNewUser: false,
      user: dbUser,
      refreshToken,
    };
  }

  const dbGoogleUser =
    await getSelectUserByGoogleUserIdAction(hashedGoogleUserId).run();

  if (dbGoogleUser) {
    await syncCartWithUser(dbGoogleUser);

    const refreshToken = await getRefreshToken(dbGoogleUser);

    return {
      isNewUser: false,
      user: dbGoogleUser,
      refreshToken,
    };
  }

  const names = googleUser.name.split(" ");

  const { cartAction, newCartId } = getCartAction(cartId);

  const newUser: InsertUser = {
    id: getRandomUUID(),
    email: googleUser.email,
    firstName: names[FIRST_NAME],
    lastName: names.slice(LAST_NAME)?.join(" ").trim() || null,
    googleUserId: hashedGoogleUserId,
    isOauth: true,
    cartId: newCartId,
    password: null,
    isValidated: false,
  };

  logger().info("Creating new user", {
    useCase: LoggerUseCaseEnum.OAUTH_GOOGLE_CALLBACK,
    data: {
      newUser,
    },
  });

  const insertUserAction = getInsertUserAction(newUser);

  const selectUserAction = getSelectUserByIdAction(newUser.id);

  const [, , user] = await runBatchOperation(
    cartAction,
    insertUserAction,
    selectUserAction,
  );

  if (!user) {
    throw new Error("User not found after creation");
  }

  logCredentials(user.cart?.id, user.id);

  const refreshToken = await getLoggedInToken(user.id);

  return {
    isNewUser: true,
    user: userSchema.parse(user),
    refreshToken,
  };
};

const getCartAction = (
  cartId?: string,
): {
  cartAction:
    | ReturnType<typeof getUpdateCartAction>
    | ReturnType<typeof getInsertCartAction>;
  newCartId: string;
} => {
  let newCartId = cartId;

  let cartAction;

  if (newCartId) {
    cartAction = getUpdateCartAction(newCartId, { isLoggedIn: true });
  } else {
    newCartId = getRandomUUID();
    cartAction = getInsertCartAction({
      isLoggedIn: true,
      id: newCartId,
    });
  }
  return { cartAction, newCartId };
};

const syncCartWithUser = async (user: User): Promise<User> => {
  const { cartId } = contextStore.context;
  logger().info("Syncing cart with user", {
    useCase: LoggerUseCaseEnum.OAUTH_GOOGLE_CALLBACK,
    data: {
      userId: user.id,
      cartId,
    },
  });
  if (!user.cart) {
    if (cartId) {
      const [, , updatedUser] = await runBatchOperation(
        getUpdateUserAction(user.id, { cartId }),
        getUpdateCartAction(cartId, { isLoggedIn: true }),
        getSelectUserByIdAction(user.id),
      );
      if (!updatedUser) {
        throw new Error("User not found after updating cart");
      }
      user.cart = updatedUser.cart;
    } else {
      const newCartId = getRandomUUID();
      const [, , updatedUser] = await runBatchOperation(
        getInsertCartAction({
          isLoggedIn: true,
          id: newCartId,
        }),
        getUpdateUserAction(user.id, { cartId: newCartId }),
        getSelectUserByIdAction(user.id),
      );
      if (!updatedUser) {
        throw new Error("User not found after creating new cart");
      }
      user.cart = updatedUser.cart;
    }
  } else {
    if (cartId) {
      await getDeleteCartAction(cartId).run();
    }
  }
  return user;
};

const getLoggedInToken = async (userId: string): Promise<string> => {
  const refreshToken = await getLoggedInRefreshToken(userId);
  await setAuthSecret(userId, refreshToken);
  return refreshToken;
};

const getRefreshToken = async (user: User): Promise<string> => {
  logCredentials(user.cart?.id, user.id);

  let refreshToken = await getAuthSecret(user.id);

  if (!refreshToken) {
    refreshToken = await getLoggedInToken(user.id);
  }
  return refreshToken;
};
