import { z } from "zod";
import { HttpResponseEnum } from "@http-entity";
import { buildResponse } from "./response";
import { AdapterError } from "@error-handling-utils";

export const errorResponse = {
  BAD_REQUEST: (error?: unknown) =>
    buildErrorResponse(error || "bad http", HttpResponseEnum.BAD_REQUEST),
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

export const generateErrorResponse = (error: unknown): Response => {
  if (error instanceof z.ZodError) {
    return errorResponse.BAD_REQUEST(
      error.issues.map((issue) => issue.message),
    );
  }

  if (error instanceof AdapterError) {
    return buildErrorResponse(error.message, Number(error.code));
  }

  if (error instanceof Error) {
    if (error.message.includes("JSON")) {
      return errorResponse.BAD_REQUEST(error.message);
    }
    return errorResponse.INTERNAL_SERVER_ERROR(error.message);
  }
  return errorResponse.INTERNAL_SERVER_ERROR(error);
};

export const buildErrorResponse = (
  error: unknown,
  status: number,
): Response => {
  return buildResponse({ error }, { status });
};
