import { errorResponse, generateErrorResponse } from "@response-entity";
import { PagesFunction } from "@cloudflare/workers-types";
import { parse } from "cookie";
import { getBodyFromRequest } from "@http-utils";
import { configPayloadSchema, getConfig } from "@config-module";

export const onRequest: PagesFunction = async (context): Promise<Response> => {
  let country: string | undefined = undefined;
  const { request } = context;
  if (request.method !== "POST") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }
  try {
    const body = await getBodyFromRequest(request);

    const {
      country: payloadCountry,
      userVersion,
      remember,
    } = configPayloadSchema.parse(body);

    if (!payloadCountry) {
      country = request.cf?.country;
    }

    const cookies = parse(request.headers.get("Cookie") ?? "");

    const { s_r: refreshToken } = cookies;

    return await getConfig(refreshToken, country, userVersion, remember);
  } catch (error) {
    return generateErrorResponse(error);
  }
};
