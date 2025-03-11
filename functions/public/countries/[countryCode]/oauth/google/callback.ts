//@ts-expect-error no types
import { google } from "worker-auth-providers";
import { PagesFunction } from "@cloudflare/workers-types";
import { requestHandler } from "@decorator-utils";
import { successResponse } from "@response-entity";
import { Env } from "@request-entity";
import { frontendHost, getCookies, setCookieInResponse } from "@http-utils";
import { InsertUser, User, userSchema } from "@user-entity";
import {
  getLoggedInRefreshToken,
  getLoggedInToken,
  getTokenCookie,
} from "@jwt-utils";
/* eslint-disable import/no-restricted-paths */
import { insertUser, selectUserByEmail } from "@user-db";
import { insertCart } from "@cart-db";
import { CookieNameEnum } from "@http-entity";
import { errors } from "@error-handling-utils";
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

export interface OAuthTokens {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token: string;
}

interface GoogleCallBackResponse {
  user: GoogleUserResponse;
  tokens: OAuthTokens;
}

const getUser = async (user: GoogleUserResponse): Promise<User> => {
  const dbUser = await selectUserByEmail(user.email);
  if (dbUser) return dbUser;

  const names = user.name.split(" ");

  const [{ cartId }] = await insertCart({ isLoggedIn: true });

  const newUser: InsertUser = {
    email: user.email,
    firstName: names[FIRST_NAME],
    lastName: names.slice(LAST_NAME)?.join(" "),
    googleUserId: user.id,
    isOauth: true,
    cartId,
  };

  const [{ userId }] = await insertUser(newUser);

  return userSchema.parse({ newUser, id: userId });
};

const GET: PagesFunction<Env> = async ({ request, env }) => {
  const cookies = getCookies(request.headers);
  const { [CookieNameEnum.OAUTH_TOKEN]: oauthTokenCookie } = cookies;
  const url = new URL(request.url);
  const state = url.searchParams.get("state");

  const { oauthToken } = JSON.parse(state ?? "{}");

  if (!oauthToken || !oauthTokenCookie || oauthToken !== oauthTokenCookie) {
    throw errors.UNAUTHORIZED();
  }

  const options = {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectUrl: frontendHost() + env.GOOGLE_REDIRECT_URI,
  };

  const { user: providerUser } = await google.users<GoogleCallBackResponse>({
    options,
    request,
  });

  if (!providerUser) {
    throw errors.USER_NOT_FOUND("no user provided by google");
  }

  const user = await getUser(providerUser);

  const response = successResponse.OK(
    "Successfully signed in with google oauth",
    {
      accessToken: getLoggedInToken(user.id, user.cart?.id),
    },
  );

  setCookieInResponse(
    response,
    getTokenCookie(await getLoggedInRefreshToken(user.id), true),
  );

  return response;
};

export const onRequest = requestHandler({ GET });
