import { PagesFunction } from "@cloudflare/workers-types";
import { HttpMethodEnum } from "@http-entity";
import { errorResponse } from "@response-entity";
import { getBodyFromRequest } from "@http-utils";
import { createAddress } from "@address-module";
import { CountriesEndpointProtectedData, Env } from "@request-entity";

export const onRequest: PagesFunction<
  Env,
  string,
  CountriesEndpointProtectedData
> = async ({ request, data }) => {
  if (request.method !== HttpMethodEnum.POST) {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  const { accessToken, refreshToken, remember } = data;
  const body = await getBodyFromRequest(request);

  return await createAddress({ accessToken, refreshToken }, remember, body);
};
