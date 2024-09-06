import { HttpResponseEnum } from "@http-entity";
import { buildResponse } from "./response";
import { getTokenCookie } from "@jwt-utils";

export const successResponse = {
  OK: (
    message: string,
    data?: unknown,
    headers?: Record<string, string>,
  ): Response =>
    buildSuccessResponse(message, HttpResponseEnum.OK, data, headers),
  CREATED: (
    message: string,
    data?: unknown,
    headers?: Record<string, string>,
  ): Response =>
    buildSuccessResponse(message, HttpResponseEnum.CREATED, data, headers),
};

export const protectedSuccessResponse = {
  OK: (
    tokens: { refreshToken: string; accessToken?: string },
    message: string,
    data?: unknown,
    remember?: boolean,
  ): Response => {
    const { refreshToken, accessToken } = tokens;
    const response = successResponse.OK(message, {
      ...(data && typeof data === "object" ? data : {}),
      accessToken,
    });
    response.headers.append(
      "Set-Cookie",
      getTokenCookie(refreshToken, "refresh", remember),
    );
    return response;
  },
  CREATED: (
    tokens: { refreshToken: string; accessToken?: string },
    message: string,
    data?: unknown,
    remember?: boolean,
  ): Response => {
    const { refreshToken, accessToken } = tokens;
    const response = successResponse.CREATED(message, {
      ...(data && typeof data === "object" ? data : {}),
      accessToken,
    });
    response.headers.append(
      "Set-Cookie",
      getTokenCookie(refreshToken, "refresh", remember),
    );
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
