import { PagesFunction } from "@cloudflare/workers-types";
import { HttpMethodEnum } from "@http-entity";
import { errorResponse } from "@response-entity";
import { getBodyFromRequest } from "@http-utils";
import { createAddress } from "@address-module";
import { getCredentials } from "@jwt-utils";

export const onRequest: PagesFunction = async ({ request }) => {
  if (request.method !== HttpMethodEnum.POST) {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  const { accessToken, refreshToken, remember } = await getCredentials(
    request.headers,
  );

  const body = await getBodyFromRequest(request);

  return await createAddress({ accessToken, refreshToken }, remember, body);
};
