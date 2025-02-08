import { HttpStatusEnum, ResponseContext } from "@http-entity";
import { buildResponse } from "./response";
/* eslint-disable import/no-restricted-paths */
import { getTokenCookie } from "@jwt-utils";
import { getRememberCookieHeader, setCookieInResponse } from "@http-utils";
import { contextStore } from "@context-utils";
/* eslint-enable import/no-restricted-paths */

export const successResponse = {
  OK: (
    message: string,
    data?: unknown,
    headers?: Record<string, string>,
  ): Response =>
    buildSuccessResponse(message, HttpStatusEnum.OK, data, headers),
  CREATED: (
    message: string,
    data?: unknown,
    headers?: Record<string, string>,
  ): Response =>
    buildSuccessResponse(message, HttpStatusEnum.CREATED, data, headers),
};

export const protectedSuccessResponse = {
  OK: (
    message: string,
    data?: unknown,
    headers?: Record<string, string>,
    context?: ResponseContext,
  ): Response => {
    const { accessToken, refreshToken, remember } =
      context ?? contextStore.context;

    const response = successResponse.OK(message, {
      ...(data && typeof data === "object" ? data : {}),
      accessToken,
    });

    setCookieInResponse(response, getTokenCookie(refreshToken, remember));

    if (remember) {
      setCookieInResponse(response, getRememberCookieHeader());
    }

    for (const header in headers) {
      response.headers.append(header, headers[header]);
    }
    return response;
  },
  CREATED: (
    message: string,
    data?: unknown,
    headers?: Record<string, string>,
    context?: ResponseContext,
  ): Response => {
    const { refreshToken, accessToken, remember } =
      context || contextStore.context;
    const response = successResponse.CREATED(message, {
      ...(data && typeof data === "object" ? data : {}),
      accessToken,
    });
    response.headers.append(
      "Set-Cookie",
      getTokenCookie(refreshToken, remember),
    );
    response.headers.append("Set-Cookie", getRememberCookieHeader());
    for (const header in headers) {
      response.headers.append(header, headers[header]);
    }
    return response;
  },
};

export const buildSuccessResponse = (
  message: string,
  status: number,
  data?: unknown,
  headers?: Record<string, string>,
): Response => {
  return buildResponse({ message, data }, { status }, headers);
};
