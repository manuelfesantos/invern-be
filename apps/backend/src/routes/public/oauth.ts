import { Hono } from "hono";
import queryString from "query-string";
import type { HonoEnv } from "../../types/hono";
import { authContext } from "../../middleware/auth-context";
import { protectedSuccessResponse, successResponse } from "@response-entity";
import {
  deleteCookieFromResponse,
  getCookieHeader,
  getCookies,
  setCookieInResponse,
} from "@http-utils";
import { CookieNameEnum } from "@http-entity";
import { contextStore } from "@context-utils";
import { encrypt } from "@crypto-utils";
import { getLoggedInToken } from "@jwt-utils";
import { errors } from "@error-handling-utils";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { ENV } from "@env-utils";
import { getGoogleOauthUser } from "@user-module";
import { userDTOSchema } from "@user-entity";
import { EMPTY_CART, toCartDTO } from "@cart-entity";
import { extendCart } from "@extender-utils";

const oauth = new Hono<HonoEnv>();

interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

/**
 * Exchanges a Google authorization `code` for the provider's user profile.
 * Native fetch replacement for the old worker-auth-providers `google.users`
 * (code → oauth2.googleapis.com/token → oauth2/v2/userinfo).
 */
const getGoogleProviderUser = async (request: Request): Promise<unknown> => {
  const code = new URL(request.url).searchParams.get("code");
  if (!code) {
    throw errors.UNAUTHORIZED("no code provided by google");
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      client_id: ENV.GOOGLE_CLIENT_ID,
      client_secret: ENV.GOOGLE_CLIENT_SECRET,
      redirect_uri: ENV.FRONTEND_HOST + ENV.GOOGLE_REDIRECT_URI,
      code,
      grant_type: "authorization_code",
    }),
  });

  const tokens = (await tokenResponse.json()) as GoogleTokenResponse;
  if (tokens.error || !tokens.access_token) {
    logger().error("Failed to exchange google code for token", {
      useCase: LoggerUseCaseEnum.OAUTH_GOOGLE_CALLBACK,
      data: { error: tokens.error, description: tokens.error_description },
    });
    throw errors.UNAUTHORIZED(tokens.error_description ?? "google token error");
  }

  const userResponse = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    { headers: { authorization: `Bearer ${tokens.access_token}` } },
  );

  return userResponse.json();
};

oauth.use("*", authContext);

oauth.get("/google/redirect", async () => {
  const { country } = contextStore.context;
  const oauthToken = await encrypt(Date.now().toString());
  const state = { country: country.code.toLowerCase(), oauthToken };
  const params = queryString.stringify({
    client_id: ENV.GOOGLE_CLIENT_ID,
    redirect_uri: `${ENV.FRONTEND_HOST}/oauth-redirect.html`,
    response_type: "code",
    scope: "openid email profile",
    include_granted_scopes: "true",
    state: JSON.stringify(state),
  });
  const googleLoginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  const response = successResponse.OK("Redirecting to Google login", {
    url: googleLoginUrl,
  });
  setCookieInResponse(
    response,
    getCookieHeader(
      CookieNameEnum.OAUTH_TOKEN,
      oauthToken,
      undefined,
      undefined,
      undefined,
      false,
    ),
  );
  return response;
});

oauth.get("/google/callback", async (c) => {
  const request = c.req.raw;
  const cookies = getCookies(request.headers);
  const { [CookieNameEnum.OAUTH_TOKEN]: oauthTokenCookie } = cookies;
  const state = new URL(request.url).searchParams.get("state");
  const { oauthToken } = JSON.parse(state ?? "{}");

  if (!oauthToken || !oauthTokenCookie || oauthToken !== oauthTokenCookie) {
    logger().error("Invalid oauth token", {
      useCase: LoggerUseCaseEnum.OAUTH_GOOGLE_CALLBACK,
      data: { oauthToken, oauthTokenCookie },
    });
    throw errors.UNAUTHORIZED();
  }

  const providerUser = await getGoogleProviderUser(request);

  if (!providerUser) {
    throw errors.USER_NOT_FOUND("no user provided by google");
  }

  const { user, refreshToken, isNewUser } = await getGoogleOauthUser(
    providerUser as Parameters<typeof getGoogleOauthUser>[0],
  );

  const response = protectedSuccessResponse.OK(
    "Successfully signed in with google oauth",
    {
      isNewUser,
      cart: extendCart(toCartDTO(user.cart ?? EMPTY_CART)),
      user: userDTOSchema.parse(user),
    },
    undefined,
    {
      accessToken: await getLoggedInToken(user.id, user.cart?.id),
      refreshToken,
      remember: true,
    },
  );

  deleteCookieFromResponse(response, CookieNameEnum.CART_ID);

  return response;
});

export default oauth;
