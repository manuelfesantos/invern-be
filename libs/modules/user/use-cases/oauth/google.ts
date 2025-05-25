import { InsertUser, User, userSchema } from "@user-entity";
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
import { getInsertCartAction } from "@cart-db";
import { runBatchOperation } from "@generics-db";

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
): Promise<{ user: User; refreshToken: string }> => {
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

    logCredentials(dbUser.cart?.id, dbUser.id);

    let refreshToken = await getAuthSecret(dbUser.id);

    if (!refreshToken) {
      refreshToken = await getLoggedInRefreshToken(dbUser.id);
      await setAuthSecret(dbUser.id, refreshToken);
    }

    return {
      user: dbUser,
      refreshToken,
    };
  }

  const dbGoogleUser =
    await getSelectUserByGoogleUserIdAction(hashedGoogleUserId).run();

  if (dbGoogleUser) {
    logCredentials(dbGoogleUser.cart?.id, dbGoogleUser.id);

    let refreshToken = await getAuthSecret(dbGoogleUser.id);

    if (!refreshToken) {
      refreshToken = await getLoggedInRefreshToken(dbGoogleUser.id);
      await setAuthSecret(dbGoogleUser.id, refreshToken);
    }

    return {
      user: dbGoogleUser,
      refreshToken,
    };
  }

  const names = googleUser.name.split(" ");

  const cartId = getRandomUUID();

  const insertCartAction = getInsertCartAction({
    isLoggedIn: true,
    id: cartId,
  });

  const newUser: InsertUser = {
    id: getRandomUUID(),
    email: googleUser.email,
    firstName: names[FIRST_NAME],
    lastName: names.slice(LAST_NAME)?.join(" ").trim() || undefined,
    googleUserId: hashedGoogleUserId,
    isOauth: true,
    cartId,
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
    insertCartAction,
    insertUserAction,
    selectUserAction,
  );

  const refreshToken = await getLoggedInRefreshToken(newUser.id);

  await setAuthSecret(newUser.id, refreshToken);

  return {
    user: userSchema.parse(user),
    refreshToken,
  };
};
