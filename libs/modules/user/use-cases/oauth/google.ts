import { InsertUser, User, userSchema } from "@user-entity";
import { getRandomUUID, hashString } from "@crypto-utils";
import { logger } from "@logger-utils";
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

  await getInsertCartAction({ isLoggedIn: true, id: cartId }).run();

  const newUser: InsertUser = {
    id: getRandomUUID(),
    email: googleUser.email,
    firstName: names[FIRST_NAME],
    lastName: names.slice(LAST_NAME)?.join(" "),
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

  await getInsertUserAction(newUser).run();

  const user = await getSelectUserByIdAction(newUser.id).run();

  const refreshToken = await getLoggedInRefreshToken(newUser.id);

  await setAuthSecret(newUser.id, refreshToken);

  return {
    user: userSchema.parse(user),
    refreshToken,
  };
};
