import {
  InsertUser,
  User,
  userSchema,
  UserValidationStatusEnum,
} from "@user-entity";
import { hashString } from "@crypto-utils";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import {
  insertUser,
  selectUserByEmail,
  selectUserByGoogleUserId,
  selectUserById,
  updateUser,
} from "@user-db";
import { getAuthSecret, setAuthSecret } from "@kv-adapter";
import { getLoggedInRefreshToken } from "@jwt-utils";
import { insertCart } from "@cart-db";
import { withTransaction } from "@db";

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

export const getGoogleOauthUser = withTransaction(
  async (
    googleUser: GoogleUserResponse,
  ): Promise<{ user: User; refreshToken: string }> => {
    const hashedGoogleUserId = await hashString(googleUser.id);

    logger().info("user from google", {
      useCase: LoggerUseCaseEnum.OAUTH_GOOGLE_CALLBACK,
      data: {
        googleUser: { ...googleUser, id: hashedGoogleUserId },
      },
    });

    const dbUser = await selectUserByEmail(
      googleUser.email,
      UserValidationStatusEnum.ALL,
    );
    if (dbUser) {
      if (!dbUser.googleUserId) {
        await updateUser(dbUser.id, {
          googleUserId: hashedGoogleUserId,
        });
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

    const dbGoogleUser = await selectUserByGoogleUserId(
      hashedGoogleUserId,
      UserValidationStatusEnum.ALL,
    );

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

    const [{ cartId }] = await insertCart({ isLoggedIn: true });

    const newUser: InsertUser = {
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

    const [{ id: userId }] = await insertUser(newUser);

    const user = await selectUserById(userId, UserValidationStatusEnum.ALL);

    const refreshToken = await getLoggedInRefreshToken(userId);

    await setAuthSecret(userId, refreshToken);

    return {
      user: userSchema.parse(user),
      refreshToken,
    };
  },
);
