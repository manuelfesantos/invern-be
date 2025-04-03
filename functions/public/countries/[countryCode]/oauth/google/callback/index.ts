import { google } from "worker-auth-providers";
import { PagesFunction } from "@cloudflare/workers-types";
import { requestHandler } from "@decorator-utils";
import { successResponse } from "@response-entity";
import {
  getCookies,
  getRememberCookieHeader,
  setCookieInResponse,
} from "@http-utils";
import { InsertUser, User, userSchema } from "@user-entity";
import {
  getLoggedInRefreshToken,
  getLoggedInToken,
  getTokenCookie,
} from "@jwt-utils";
/* eslint-disable import/no-restricted-paths */
import {
  insertUser,
  selectUserByEmail,
  selectUserByGoogleUserId,
  selectUserById,
  updateUser,
} from "@user-db";
import { insertCart } from "@cart-db";
import { CookieNameEnum } from "@http-entity";
import { errors } from "@error-handling-utils";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { getAuthSecret, setAuthSecret } from "@kv-adapter";
import { hashString } from "@crypto-utils";
import { ENV } from "@env-utils";
/* eslint-enable import/no-restricted-paths */

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

const getUser = async (
  googleUser: GoogleUserResponse,
): Promise<{ user: User; refreshToken: string }> => {
  const hashedGoogleUserId = await hashString(googleUser.id);

  logger().info("user from google", {
    useCase: LoggerUseCaseEnum.OAUTH_GOOGLE_CALLBACK,
    data: {
      googleUser,
    },
  });
  const dbUser = await selectUserByEmail(googleUser.email);
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

  const dbGoogleUser = await selectUserByGoogleUserId(hashedGoogleUserId);

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

  const [{ userId }] = await insertUser(newUser);

  const user = await selectUserById(userId);

  const refreshToken = await getLoggedInRefreshToken(userId);

  await setAuthSecret(userId, refreshToken);

  return {
    user: userSchema.parse(user),
    refreshToken,
  };
};

const GET: PagesFunction = async ({ request }) => {
  const cookies = getCookies(request.headers);
  const { [CookieNameEnum.OAUTH_TOKEN]: oauthTokenCookie } = cookies;
  const url = new URL(request.url);
  const state = url.searchParams.get("state");

  const { oauthToken } = JSON.parse(state ?? "{}");

  if (!oauthToken || !oauthTokenCookie || oauthToken !== oauthTokenCookie) {
    logger().error("Invalid oauth token", {
      useCase: LoggerUseCaseEnum.OAUTH_GOOGLE_CALLBACK,
      data: {
        oauthToken,
        oauthTokenCookie,
      },
    });

    throw errors.UNAUTHORIZED();
  }

  const options = {
    clientId: ENV.GOOGLE_CLIENT_ID,
    clientSecret: ENV.GOOGLE_CLIENT_SECRET,
    redirectUrl: ENV.FRONTEND_HOST + ENV.GOOGLE_REDIRECT_URI,
  };

  const { user: providerUser } = await google.users({
    options,
    request,
  });

  if (!providerUser) {
    throw errors.USER_NOT_FOUND("no user provided by google");
  }

  const { user, refreshToken } = await getUser(providerUser);

  const response = successResponse.OK(
    "Successfully signed in with google oauth",
    {
      accessToken: getLoggedInToken(user.id, user.cart?.id),
    },
  );

  setCookieInResponse(response, getTokenCookie(refreshToken, true));
  setCookieInResponse(response, getRememberCookieHeader());

  return response;
};

export const onRequest = requestHandler({ GET });
