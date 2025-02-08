import { requestHandler } from "@decorator-utils";
import { PagesFunction } from "@cloudflare/workers-types";
import { logout } from "@user-module";
import { protectedSuccessResponse } from "@response-entity";
import { deleteCookieFromResponse } from "@http-utils";
import { CookieNameEnum } from "@http-entity";

const POST: PagesFunction = async () => {
  const { responseContext } = await logout();

  const response = protectedSuccessResponse.OK(
    "successfully logged out",
    undefined,
    undefined,
    responseContext,
  );

  deleteCookieFromResponse(response, CookieNameEnum.REMEMBER);

  return response;
};

export const onRequest = requestHandler({ POST });
