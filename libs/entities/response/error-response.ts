import { z, ZodError } from "zod";
import { HttpResponseEnum } from "@http-entity";
import { buildResponse } from "./response";
import { CustomError } from "@error-handling-utils";

export const errorResponse = {
  BAD_REQUEST: (error?: unknown, headers?: Record<string, string>) =>
    buildErrorResponse(
      error || simplifyError(new Error("bad http request")),
      HttpResponseEnum.BAD_REQUEST,
      headers,
    ),
  UNAUTHORIZED: (error?: unknown, headers?: Record<string, string>) =>
    buildErrorResponse(
      error || simplifyError(new Error("unauthorized")),
      HttpResponseEnum.UNAUTHORIZED,
      headers,
    ),
  FORBIDDEN: (error?: unknown, headers?: Record<string, string>) =>
    buildErrorResponse(
      error || prepareError("forbidden"),
      HttpResponseEnum.FORBIDDEN,
      headers,
    ),
  NOT_FOUND: (error?: unknown, headers?: Record<string, string>) =>
    buildErrorResponse(
      error || prepareError("not found"),
      HttpResponseEnum.NOT_FOUND,
      headers,
    ),
  METHOD_NOT_ALLOWED: (error?: unknown, headers?: Record<string, string>) =>
    buildErrorResponse(
      error || prepareError("method not allowed"),
      HttpResponseEnum.METHOD_NOT_ALLOWED,
      headers,
    ),
  CONFLICT: (error?: unknown, headers?: Record<string, string>) =>
    buildErrorResponse(
      error || prepareError("conflict"),
      HttpResponseEnum.CONFLICT,
      headers,
    ),
  INTERNAL_SERVER_ERROR: (error?: unknown, headers?: Record<string, string>) =>
    buildErrorResponse(
      error || prepareError("internal server error"),
      HttpResponseEnum.INTERNAL_SERVER_ERROR,
      headers,
    ),
} as const;

export const prepareError = (message: string): SimpleError => {
  return simplifyError(new Error(message));
};

interface SimplifiedZodError {
  issues: z.ZodIssue[];
  name: string;
  cause: unknown;
  stack?: string;
  message: string;
}

interface SimpleError {
  name: string;
  cause: unknown;
  stack?: string;
  message: string;
}

export const generateErrorResponse = (
  error: unknown,
  headers?: Record<string, string>,
): Response => {
  if (error instanceof z.ZodError) {
    return errorResponse.BAD_REQUEST(simplifyZodError(error), headers);
  }

  if (error instanceof CustomError) {
    return buildErrorResponse(
      simplifyError(error),
      Number(error.code),
      headers,
    );
  }

  if (error instanceof Error && error.message.includes("JSON")) {
    return errorResponse.BAD_REQUEST(simplifyError(error), headers);
  }
  if (error instanceof Error) {
    return errorResponse.INTERNAL_SERVER_ERROR(simplifyError(error), headers);
  }

  return errorResponse.INTERNAL_SERVER_ERROR(error, headers);
};

export const buildErrorResponse = (
  error: unknown,
  status: number,
  headers?: Record<string, string>,
): Response => buildResponse({ error }, { status }, headers);

export const simplifyZodError = (error: ZodError): SimplifiedZodError => {
  return {
    issues: error.issues,
    name: error.name,
    cause: error.cause,
    stack: error.stack,
    message: error.message,
  };
};

export const simplifyError = (error: Error): SimpleError => {
  return {
    name: error.name,
    cause: error.cause,
    stack: error.stack,
    message: error.message,
  };
};
