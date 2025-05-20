import { google } from "worker-auth-providers";
import { PagesFunction } from "@cloudflare/workers-types";
import { requestHandler } from "@decorator-utils";
import { successResponse } from "@response-entity";
import {
  getCookies,
  getRememberCookieHeader,
  setCookieInResponse,
} from "@http-utils";
import { getLoggedInToken, getTokenCookie } from "@jwt-utils";
import { CookieNameEnum } from "@http-entity";
import { errors } from "@error-handling-utils";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { ENV } from "@env-utils";
import { getGoogleOauthUser } from "@user-module";

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

  const { user, refreshToken } = await getGoogleOauthUser(providerUser);

  const response = successResponse.OK(
    "Successfully signed in with google oauth",
    {
      cart: user.cart,
      user,
      accessToken: await getLoggedInToken(user.id, user.cart?.id),
    },
  );

  setCookieInResponse(response, getTokenCookie(refreshToken, true));
  setCookieInResponse(response, getRememberCookieHeader());

  return response;
};

export const onRequest = requestHandler({ GET });
