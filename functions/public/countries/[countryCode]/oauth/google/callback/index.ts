import { google } from "worker-auth-providers";
import { requestHandler } from "@decorator-utils";
import { protectedSuccessResponse } from "@response-entity";
import { deleteCookieFromResponse, getCookies } from "@http-utils";
import { getLoggedInToken } from "@jwt-utils";
import { CookieNameEnum } from "@http-entity";
import { errors } from "@error-handling-utils";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { ENV } from "@env-utils";
import { getGoogleOauthUser } from "@user-module";
import { userDTOSchema } from "@user-entity";
import { EMPTY_CART, toCartDTO } from "@cart-entity";
import { extendCart } from "@extender-utils";

export const onRequestGet = requestHandler(async ({ request }) => {
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
      refreshToken: refreshToken,
      remember: true,
    },
  );

  deleteCookieFromResponse(response, CookieNameEnum.CART_ID);

  return response;
});
