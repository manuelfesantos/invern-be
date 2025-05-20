import { requestHandler } from "@decorator-utils";
import { successResponse } from "@response-entity";
import { getCookieHeader, setCookieInResponse } from "@http-utils";
import { contextStore } from "@context-utils";
import { encrypt } from "@crypto-utils";
import { CookieNameEnum } from "@http-entity";
import queryString from "query-string";
import { ENV } from "@env-utils";

const GET: PagesFunction = async () => {
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
};

export const onRequest = requestHandler({ GET });
