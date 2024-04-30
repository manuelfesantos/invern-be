import { z } from "zod";
import { HttpResponseEnum } from "@entities/http/http-response";
import { buildResponse } from "@entities/response/response";

export const errorResponse = {
  BAD_REQUEST: (error?: unknown) =>
    buildErrorResponse(error || "bad request", HttpResponseEnum.BAD_REQUEST),
  UNAUTHORIZED: (error?: unknown) =>
    buildErrorResponse(error || "unauthorized", HttpResponseEnum.UNAUTHORIZED),
  FORBIDDEN: (error?: unknown) =>
    buildErrorResponse(error || "forbidden", HttpResponseEnum.FORBIDDEN),
  NOT_FOUND: (error?: unknown) =>
    buildErrorResponse(error || "not found", HttpResponseEnum.NOT_FOUND),
  METHOD_NOT_ALLOWED: (error?: unknown) =>
    buildErrorResponse(
      error || "method not allowed",
      HttpResponseEnum.METHOD_NOT_ALLOWED,
    ),
  CONFLICT: (error?: unknown) =>
    buildErrorResponse(error || "conflict", HttpResponseEnum.CONFLICT),
  INTERNAL_SERVER_ERROR: (error?: unknown) =>
    buildErrorResponse(
      error || "internal server error",
      HttpResponseEnum.INTERNAL_SERVER_ERROR,
    ),
} as const;

export const generateErrorResponse = (error: any) => {
  if (error instanceof z.ZodError) {
    return errorResponse.BAD_REQUEST(
      error.issues.map((issue) => issue.message),
    );
  }
  return error.code
    ? buildErrorResponse(error.message, error.code)
    : errorResponse.INTERNAL_SERVER_ERROR(error.message);
};

export const buildErrorResponse = (error: unknown, status: number) => {
  return buildResponse({ error }, { status });
};
