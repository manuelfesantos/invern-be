import { requestHandler } from "@decorator-utils";
import { successResponse } from "@response-entity";
import { Env } from "@request-entity";
import {
  frontendHost,
  getCookieHeader,
  setCookieInResponse,
} from "@http-utils";
import { contextStore } from "@context-utils";
import { encrypt } from "@crypto-utils";
import { CookieNameEnum } from "@http-entity";

const GET: PagesFunction<Env> = async ({ env }) => {
  const { country } = contextStore.context;
  const { GOOGLE_CLIENT_ID } = env;
  const oauthToken = await encrypt(Date.now().toString());
  const state = { country: country.code, oauthToken };
  const params = (await import("query-string")).default.stringify({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: `${frontendHost()}/api/user/oauth/google/callback`,
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
    getCookieHeader(CookieNameEnum.OAUTH_TOKEN, oauthToken),
  );

  return response;
};

export const onRequest = requestHandler({ GET });
