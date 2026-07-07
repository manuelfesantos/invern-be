import { Hono } from "hono";
import queryString from "query-string";
import { google } from "worker-auth-providers";
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

  const { user: providerUser } = await google.users({
    options: {
      clientId: ENV.GOOGLE_CLIENT_ID,
      clientSecret: ENV.GOOGLE_CLIENT_SECRET,
      redirectUrl: ENV.FRONTEND_HOST + ENV.GOOGLE_REDIRECT_URI,
    },
    request,
  });

  if (!providerUser) {
    throw errors.USER_NOT_FOUND("no user provided by google");
  }

  const { user, refreshToken, isNewUser } =
    await getGoogleOauthUser(providerUser);

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
