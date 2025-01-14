import { z, ZodError } from "zod";
import { HttpStatusEnum } from "@http-entity";
import { buildResponse } from "./response";
import { CustomError } from "@error-handling-utils";
import { localLogger } from "@logger-utils";

export const errorResponse = {
  BAD_REQUEST: (error?: unknown, headers?: Record<string, string>) =>
    buildErrorResponse(
      error || simplifyError(new Error("bad http request")),
      HttpStatusEnum.BAD_REQUEST,
      headers,
    ),
  UNAUTHORIZED: (error?: unknown, headers?: Record<string, string>) =>
    buildErrorResponse(
      error || simplifyError(new Error("unauthorized")),
      HttpStatusEnum.UNAUTHORIZED,
      headers,
    ),
  FORBIDDEN: (error?: unknown, headers?: Record<string, string>) =>
    buildErrorResponse(
      error || prepareError("forbidden"),
      HttpStatusEnum.FORBIDDEN,
      headers,
    ),
  NOT_FOUND: (error?: unknown, headers?: Record<string, string>) =>
    buildErrorResponse(
      error || prepareError("not found"),
      HttpStatusEnum.NOT_FOUND,
      headers,
    ),
  METHOD_NOT_ALLOWED: (error?: unknown, headers?: Record<string, string>) =>
    buildErrorResponse(
      error || prepareError("method not allowed"),
      HttpStatusEnum.METHOD_NOT_ALLOWED,
      headers,
    ),
  CONFLICT: (error?: unknown, headers?: Record<string, string>) =>
    buildErrorResponse(
      error || prepareError("conflict"),
      HttpStatusEnum.CONFLICT,
      headers,
    ),
  INTERNAL_SERVER_ERROR: (error?: unknown, headers?: Record<string, string>) =>
    buildErrorResponse(
      error || prepareError("internal server error"),
      HttpStatusEnum.INTERNAL_SERVER_ERROR,
      headers,
    ),
} as const;

export const prepareError = (message: string, cause?: string): SimpleError => {
  const error = new Error(message);
  if (cause) {
    Object.assign(error, cause);
  }
  return simplifyError(error);
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
    const zodError = simplifyZodError(error);
    localLogger.error(zodError);
    return errorResponse.BAD_REQUEST(zodError, headers);
  }

  if (error instanceof CustomError) {
    const simplifiedError = simplifyError(error);
    localLogger.error(simplifiedError);
    return buildErrorResponse(simplifiedError, Number(error.code), headers);
  }

  if (error instanceof Error && error.cause === "UNABLE_TO_PARSE_BODY") {
    const simplifiedError = simplifyError(error);
    localLogger.error(simplifiedError);
    return errorResponse.BAD_REQUEST(simplifiedError, headers);
  }
  if (error instanceof Error) {
    const simplifiedError = simplifyError(error);
    localLogger.error(simplifiedError);
    return errorResponse.INTERNAL_SERVER_ERROR(simplifiedError, headers);
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
